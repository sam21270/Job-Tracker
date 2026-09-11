using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JobTracker.Api.Data;
using JobTracker.Api.Models;

namespace JobTracker.Api.Controllers;

public record LoginRequest(string Username, string Password);

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var key = _config["Jwt:Key"]!;
        var issuer = _config["Jwt:Issuer"]!;

        var claims = new[] { new Claim(ClaimTypes.Name, user.Username) };
        var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: issuer,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
    }
    [HttpPost("seed-user")]
public async Task<ActionResult> SeedUser(LoginRequest request)
{
    if (await _context.Users.AnyAsync()) return BadRequest("User already exists");

    var user = new User
    {
        Username = request.Username,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
    };
    _context.Users.Add(user);
    await _context.SaveChangesAsync();
    return Ok(new { message = "User created" });
}
}