using MedicalImageApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register custom services
builder.Services.AddSingleton<IImageBufferService, ImageBufferService>();

// Configure CORS for local Electron app
builder.Services.AddCors(options =>
{
    options.AddPolicy("ElectronApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "file://")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowedToReturnTrue();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ElectronApp");
app.UseRouting();
app.MapControllers();

// Configure to run on specific port
app.Urls.Add("http://localhost:5174");

app.Run();