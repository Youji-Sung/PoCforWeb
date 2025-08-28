using MedicalImageApi.Models;

namespace MedicalImageApi.Services
{
    public enum PlaybackState { Stopped, Playing, Paused }

    public interface IImageBufferService
    {
        Task<ImageBuffer> GenerateBufferAsync(ImageBufferRequest request);
        Task<byte[]> GenerateMedicalImageAsync(int width, int height, int channels = 1);
        Task<byte[]> GenerateTestPatternAsync(int width, int height, int channels = 4);
        Task<byte[]> GenerateNoiseAsync(int width, int height, int channels = 4);
        PerformanceMetrics GetLastGenerationMetrics();
        void ResetFrameCounter();
        void Play();
        void Pause();
        void Stop();
        PlaybackState GetPlaybackStatus();
        int GetCurrentFrame();
    }
}