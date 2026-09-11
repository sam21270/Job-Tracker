using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Models;

namespace JobTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }

    public DbSet<JobApplication> JobApplications { get; set; }
}