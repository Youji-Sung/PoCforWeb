using MedicalImageApi.Models;
using System.Diagnostics;

namespace MedicalImageApi.Services
{
    public class ImageBufferService : IImageBufferService
    {
        private PerformanceMetrics _lastMetrics = new();
        private readonly ILogger<ImageBufferService> _logger;
        private int _frameCounter = 0;
        private PlaybackState _playbackState = PlaybackState.Stopped;

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
                int frame = _frameCounter;
                int bytesPerPixel = channels;
                int stride = width * bytesPerPixel;
                byte[] buffer = new byte[stride * height];

                for (int y = 0; y < height; y++)
                {
                    for (int x = 0; x < width; x++)
                    {
                        int index = (y * stride) + (x * bytesPerPixel);

                        // BGRA 형식 (Blue, Green, Red, Alpha) - WPF와 동일한 패턴
                        buffer[index] = (byte)(_frameCounter % 256);           // Blue - 시간 기반 변화
                        buffer[index + 1] = (byte)((y + _frameCounter) % 256); // Green - y축 기반 그라디언트 + 시간
                        buffer[index + 2] = (byte)((x + _frameCounter) % 256); // Red - x축 기반 그라디언트 + 시간
                        if (channels == 4)
                            buffer[index + 3] = 255; // Alpha - 완전 불투명
                    }
                }

                // Playing 상태일 때만 프레임 카운터를 증가시킵니다.
                if (_playbackState == PlaybackState.Playing)
                {
                    _frameCounter++;
                }

                return buffer;
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

        public void ResetFrameCounter()
        {
            _frameCounter = 0;
        }

        public void Play()
        {
            _playbackState = PlaybackState.Playing;
        }

        public void Pause()
        {
            _playbackState = PlaybackState.Paused;
        }

        public void Stop()
        {
            _playbackState = PlaybackState.Stopped;
            _frameCounter = 0;
        }

        public PlaybackState GetPlaybackStatus()
        {
            return _playbackState;
        }

        public int GetCurrentFrame()
        {
            return _frameCounter;
        }
    }
}