package com.theladders.solid.isp.jobs;

public class Job
{
  public void recordViewBy(@SuppressWarnings("unused") Jobseeker jobseeker) {}

  public JobRepresentation representationFor(@SuppressWarnings("unused") Jobseeker jobseeker)
  {
    return new JobRepresentation();
  }

  public boolean requiresPermissions()
  {
    return false;
  }
}
