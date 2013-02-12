package com.theladders.solid.isp.jobs;

public class JobRepository
{
  public Job getJob(@SuppressWarnings("unused") JobLocationId id)
  {
    return new Job();
  }
}
