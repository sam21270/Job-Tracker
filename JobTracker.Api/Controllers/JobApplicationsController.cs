using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Data;
using JobTracker.Api.Models;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobApplicationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public JobApplicationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<JobApplication>>> GetAll()
    {
        return await _context.JobApplications.ToListAsync();
    }

    [HttpGet("counts")]
    public async Task<ActionResult> GetCounts()
    {
        var all = await _context.JobApplications.ToListAsync();
        var today = DateTime.UtcNow.Date;

        return Ok(new
        {
            total = all.Count,
            today = all.Count(a => a.DateApplied.Date == today),
            thisWeek = all.Count(a => a.DateApplied >= today.AddDays(-(int)today.DayOfWeek)),
            thisMonth = all.Count(a => a.DateApplied.Year == today.Year && a.DateApplied.Month == today.Month)
        });
    }

    [HttpPost]
    public async Task<ActionResult<JobApplication>> Create(JobApplication application)
    {
        _context.JobApplications.Add(application);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = application.Id }, application);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, JobApplication updated)
    {
        var existing = await _context.JobApplications.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Company = updated.Company;
        existing.Role = updated.Role;
        existing.Source = updated.Source;
        existing.Status = updated.Status;
        existing.FollowUpStatus = updated.FollowUpStatus;
        existing.DateApplied = updated.DateApplied;
        existing.Notes = updated.Notes;
        existing.PostingUrl = updated.PostingUrl;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _context.JobApplications.FindAsync(id);
        if (existing == null) return NotFound();

        _context.JobApplications.Remove(existing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}