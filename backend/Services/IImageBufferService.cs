using MedicalImageApi.Models;

namespace MedicalImageApi.Services
{
    public interface IImageBufferService
    {
        Task<ImageBuffer> GenerateBufferAsync(ImageBufferRequest request);
        Task<byte[]> GenerateMedicalImageAsync(int width, int height, int channels = 1);
        Task<byte[]> GenerateTestPatternAsync(int width, int height, int channels = 4);
        Task<byte[]> GenerateNoiseAsync(int width, int height, int channels = 4);
        PerformanceMetrics GetLastGenerationMetrics();
    }
}