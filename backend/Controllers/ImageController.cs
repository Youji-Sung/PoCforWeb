using Microsoft.AspNetCore.Mvc;
using MedicalImageApi.Models;
using MedicalImageApi.Services;

namespace MedicalImageApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageController : ControllerBase
    {
        private readonly IImageBufferService _imageBufferService;
        private readonly ILogger<ImageController> _logger;

        public ImageController(IImageBufferService imageBufferService, ILogger<ImageController> logger)
        {
            _imageBufferService = imageBufferService;
            _logger = logger;
        }

        [HttpPost("generate")]
        public async Task<ActionResult<ImageBuffer>> GenerateImage([FromBody] ImageBufferRequest request)
        {
            try
            {
                if (request.Width <= 0 || request.Height <= 0)
                {
                    return BadRequest("Width and height must be positive integers");
                }

                if (request.Width > 4096 || request.Height > 4096)
                {
                    return BadRequest("Image dimensions too large (max 4096x4096)");
                }

                var buffer = await _imageBufferService.GenerateBufferAsync(request);
                
                _logger.LogInformation($"Generated {request.Width}x{request.Height} image in {buffer.GenerationTimeMs:F2}ms");
                
                return Ok(buffer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating image buffer");
                return StatusCode(500, "Internal server error while generating image");
            }
        }

        [HttpGet("test/{size}")]
        public async Task<ActionResult<ImageBuffer>> GenerateTestImage(string size)
        {
            var dimensions = size.Split('x');
            if (dimensions.Length != 2 || 
                !int.TryParse(dimensions[0], out var width) || 
                !int.TryParse(dimensions[1], out var height))
            {
                return BadRequest("Size must be in format 'widthxheight' (e.g., '1000x1000')");
            }

            var request = new ImageBufferRequest
            {
                Width = width,
                Height = height,
                ImageType = "test",
                Channels = 4
            };

            return await GenerateImage(request);
        }

        [HttpGet("medical/{size}")]
        public async Task<ActionResult<ImageBuffer>> GenerateMedicalImage(string size)
        {
            var dimensions = size.Split('x');
            if (dimensions.Length != 2 || 
                !int.TryParse(dimensions[0], out var width) || 
                !int.TryParse(dimensions[1], out var height))
            {
                return BadRequest("Size must be in format 'widthxheight' (e.g., '1000x1000')");
            }

            var request = new ImageBufferRequest
            {
                Width = width,
                Height = height,
                ImageType = "medical",
                Channels = 1 // Medical images are typically grayscale
            };

            return await GenerateImage(request);
        }

        [HttpGet("performance")]
        public ActionResult<PerformanceMetrics> GetPerformanceMetrics()
        {
            var metrics = _imageBufferService.GetLastGenerationMetrics();
            return Ok(metrics);
        }

        [HttpGet("health")]
        public ActionResult<object> HealthCheck()
        {
            return Ok(new { 
                status = "healthy", 
                timestamp = DateTime.UtcNow,
                version = "1.0.0"
            });
        }

        [HttpPost("reset")]
        public ActionResult ResetFrameCounter()
        {
            try
            {
                _imageBufferService.ResetFrameCounter();
                _logger.LogInformation("Frame counter reset");
                return Ok(new { message = "Frame counter reset successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting frame counter");
                return StatusCode(500, "Internal server error while resetting frame counter");
            }
        }

        [HttpPost("play")]
        public ActionResult Play()
        {
            try
            {
                _imageBufferService.Play();
                _logger.LogInformation("Animation started");
                return Ok(new { status = "playing", message = "Animation started successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting animation");
                return StatusCode(500, "Internal server error while starting animation");
            }
        }

        [HttpPost("pause")]
        public ActionResult Pause()
        {
            try
            {
                _imageBufferService.Pause();
                _logger.LogInformation("Animation paused");
                return Ok(new { status = "paused", message = "Animation paused successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pausing animation");
                return StatusCode(500, "Internal server error while pausing animation");
            }
        }

        [HttpPost("stop")]
        public ActionResult Stop()
        {
            try
            {
                _imageBufferService.Stop();
                _logger.LogInformation("Animation stopped");
                return Ok(new { status = "stopped", message = "Animation stopped successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping animation");
                return StatusCode(500, "Internal server error while stopping animation");
            }
        }

        [HttpGet("status")]
        public ActionResult GetPlaybackStatus()
        {
            try
            {
                var status = _imageBufferService.GetPlaybackStatus();
                return Ok(new { 
                    status = status.ToString().ToLower(),
                    frameCounter = _imageBufferService.GetCurrentFrame(),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting playback status");
                return StatusCode(500, "Internal server error while getting playback status");
            }
        }
    }
}