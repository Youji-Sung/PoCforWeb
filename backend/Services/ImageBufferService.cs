using MedicalImageApi.Models;
using System.Diagnostics;

namespace MedicalImageApi.Services
{
    public class ImageBufferService : IImageBufferService
    {
        private PerformanceMetrics _lastMetrics = new();
        private readonly ILogger<ImageBufferService> _logger;

        public ImageBufferService(ILogger<ImageBufferService> logger)
        {
            _logger = logger;
        }

        public async Task<ImageBuffer> GenerateBufferAsync(ImageBufferRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            var memoryBefore = GC.GetTotalMemory(false);

            byte[] data = request.ImageType.ToLower() switch
            {
                "medical" => await GenerateMedicalImageAsync(request.Width, request.Height, request.Channels),
                "test" => await GenerateTestPatternAsync(request.Width, request.Height, request.Channels),
                "noise" => await GenerateNoiseAsync(request.Width, request.Height, request.Channels),
                _ => await GenerateTestPatternAsync(request.Width, request.Height, request.Channels)
            };

            stopwatch.Stop();
            var memoryAfter = GC.GetTotalMemory(false);

            var metrics = new PerformanceMetrics
            {
                GenerationTimeMs = stopwatch.Elapsed.TotalMilliseconds,
                MemoryUsedBytes = memoryAfter - memoryBefore,
                BufferSizeBytes = data.Length
            };

            _lastMetrics = metrics;

            _logger.LogInformation($"Generated {request.Width}x{request.Height} buffer in {metrics.GenerationTimeMs:F2}ms");

            return new ImageBuffer
            {
                Data = data,
                Width = request.Width,
                Height = request.Height,
                Channels = request.Channels,
                Format = request.Channels == 1 ? "Grayscale" : 
                        request.Channels == 3 ? "RGB" : "RGBA",
                GenerationTimeMs = metrics.GenerationTimeMs
            };
        }

        public async Task<byte[]> GenerateMedicalImageAsync(int width, int height, int channels = 1)
        {
            return await Task.Run(() =>
            {
                var data = new byte[width * height * channels];
                var random = new Random();
                
                var centerX = width / 2.0;
                var centerY = height / 2.0;
                var maxRadius = Math.Min(centerX, centerY);

                Parallel.For(0, height, y =>
                {
                    for (int x = 0; x < width; x++)
                    {
                        var dx = x - centerX;
                        var dy = y - centerY;
                        var distance = Math.Sqrt(dx * dx + dy * dy);
                        var normalizedDistance = distance / maxRadius;

                        double intensity = 0;

                        if (normalizedDistance < 0.9)
                        {
                            // Simulate organ structure with varying densities
                            var angle = Math.Atan2(dy, dx);
                            var radialPattern = Math.Sin(normalizedDistance * 12) * 0.3 + 0.7;
                            var angularPattern = Math.Sin(angle * 8) * 0.2 + 0.8;
                            
                            // Add realistic medical image noise
                            lock (random)
                            {
                                var noise = (random.NextDouble() - 0.5) * 0.15;
                                intensity = (radialPattern * angularPattern + noise) * (1 - normalizedDistance * 0.4);
                            }

                            // Add some vessel-like structures
                            if (normalizedDistance > 0.2 && normalizedDistance < 0.7)
                            {
                                var vesselPattern = Math.Sin(angle * 3 + normalizedDistance * 20);
                                if (vesselPattern > 0.8)
                                {
                                    intensity *= 1.3; // Brighter vessels
                                }
                            }
                        }
                        else
                        {
                            // Background with minimal noise
                            lock (random)
                            {
                                intensity = random.NextDouble() * 0.05;
                            }
                        }

                        var baseIndex = (y * width + x) * channels;
                        var pixelValue = (byte)Math.Max(0, Math.Min(255, intensity * 255));

                        for (int c = 0; c < channels; c++)
                        {
                            data[baseIndex + c] = pixelValue;
                        }
                    }
                });

                return data;
            });
        }

        public async Task<byte[]> GenerateTestPatternAsync(int width, int height, int channels = 4)
        {
            return await Task.Run(() =>
            {
                var data = new byte[width * height * channels];
                var time = DateTime.Now.Millisecond * 0.001;

                Parallel.For(0, height, y =>
                {
                    for (int x = 0; x < width; x++)
                    {
                        var normalizedX = (double)x / width;
                        var normalizedY = (double)y / height;

                        // Animated wave patterns
                        var wave1 = Math.Sin(normalizedX * 20 + time * 2) * 0.5 + 0.5;
                        var wave2 = Math.Sin(normalizedY * 15 + time * 1.5) * 0.5 + 0.5;
                        var wave3 = Math.Sin((normalizedX + normalizedY) * 10 + time) * 0.5 + 0.5;

                        // Radial gradient from center
                        var centerX = normalizedX - 0.5;
                        var centerY = normalizedY - 0.5;
                        var distance = Math.Sqrt(centerX * centerX + centerY * centerY);
                        var radial = Math.Cos(distance * 10 + time * 3) * 0.5 + 0.5;

                        var baseIndex = (y * width + x) * channels;

                        if (channels >= 3)
                        {
                            data[baseIndex] = (byte)((wave1 * radial) * 255);     // Red
                            data[baseIndex + 1] = (byte)((wave2 * radial) * 255); // Green  
                            data[baseIndex + 2] = (byte)((wave3 * radial) * 255); // Blue
                            if (channels == 4)
                                data[baseIndex + 3] = 255; // Alpha
                        }
                        else
                        {
                            // Grayscale
                            data[baseIndex] = (byte)((wave1 * radial) * 255);
                        }
                    }
                });

                return data;
            });
        }

        public async Task<byte[]> GenerateNoiseAsync(int width, int height, int channels = 4)
        {
            return await Task.Run(() =>
            {
                var data = new byte[width * height * channels];
                var random = new Random();

                Parallel.For(0, height, y =>
                {
                    var localRandom = new Random(random.Next() + y);
                    for (int x = 0; x < width; x++)
                    {
                        var baseIndex = (y * width + x) * channels;
                        for (int c = 0; c < channels; c++)
                        {
                            if (c == 3 && channels == 4)
                                data[baseIndex + c] = 255; // Alpha
                            else
                                data[baseIndex + c] = (byte)localRandom.Next(256);
                        }
                    }
                });

                return data;
            });
        }

        public PerformanceMetrics GetLastGenerationMetrics()
        {
            return _lastMetrics;
        }
    }
}