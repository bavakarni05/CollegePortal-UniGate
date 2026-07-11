package com.example.collegeportal.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long collegeId;
    private String name;
    private String quota;
    private Integer seats;
    private Integer totalSeats;
    private Double cutoff;
    private String eligibility;
    private Double fees;

    // Community categories for Government Quota visibility
    private Integer seatsOC;
    private Integer seatsBC;
    private Integer seatsMBC;
    private Integer seatsSCST;
    private Integer seatsBCM;

    // Community Cutoffs
    private Double cutoffOC;
    private Double cutoffBC;
    private Double cutoffMBC;
    private Double cutoffSCST;
    private Double cutoffBCM;

    // Community Eligibility
    private String eligibilityOC;
    private String eligibilityBC;
    private String eligibilityMBC;
    private String eligibilitySCST;
    private String eligibilityBCM;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCollegeId() { return collegeId; }
    public void setCollegeId(Long collegeId) { this.collegeId = collegeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getQuota() { return quota; }
    public void setQuota(String quota) { this.quota = quota; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Double getCutoff() { return cutoff; }
    public void setCutoff(Double cutoff) { this.cutoff = cutoff; }

    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }

    public Double getFees() { return fees; }
    public void setFees(Double fees) { this.fees = fees; }

    public Integer getSeatsOC() { return seatsOC; }
    public void setSeatsOC(Integer seatsOC) { this.seatsOC = seatsOC; }

    public Integer getSeatsBC() { return seatsBC; }
    public void setSeatsBC(Integer seatsBC) { this.seatsBC = seatsBC; }

    public Integer getSeatsMBC() { return seatsMBC; }
    public void setSeatsMBC(Integer seatsMBC) { this.seatsMBC = seatsMBC; }

    public Integer getSeatsSCST() { return seatsSCST; }
    public void setSeatsSCST(Integer seatsSCST) { this.seatsSCST = seatsSCST; }

    public Integer getSeatsBCM() { return seatsBCM; }
    public void setSeatsBCM(Integer seatsBCM) { this.seatsBCM = seatsBCM; }

    public Double getCutoffOC() { return cutoffOC; }
    public void setCutoffOC(Double cutoffOC) { this.cutoffOC = cutoffOC; }

    public Double getCutoffBC() { return cutoffBC; }
    public void setCutoffBC(Double cutoffBC) { this.cutoffBC = cutoffBC; }

    public Double getCutoffMBC() { return cutoffMBC; }
    public void setCutoffMBC(Double cutoffMBC) { this.cutoffMBC = cutoffMBC; }

    public Double getCutoffSCST() { return cutoffSCST; }
    public void setCutoffSCST(Double cutoffSCST) { this.cutoffSCST = cutoffSCST; }

    public Double getCutoffBCM() { return cutoffBCM; }
    public void setCutoffBCM(Double cutoffBCM) { this.cutoffBCM = cutoffBCM; }

    public String getEligibilityOC() { return eligibilityOC; }
    public void setEligibilityOC(String eligibilityOC) { this.eligibilityOC = eligibilityOC; }

    public String getEligibilityBC() { return eligibilityBC; }
    public void setEligibilityBC(String eligibilityBC) { this.eligibilityBC = eligibilityBC; }

    public String getEligibilityMBC() { return eligibilityMBC; }
    public void setEligibilityMBC(String eligibilityMBC) { this.eligibilityMBC = eligibilityMBC; }

    public String getEligibilitySCST() { return eligibilitySCST; }
    public void setEligibilitySCST(String eligibilitySCST) { this.eligibilitySCST = eligibilitySCST; }

    public String getEligibilityBCM() { return eligibilityBCM; }
    public void setEligibilityBCM(String eligibilityBCM) { this.eligibilityBCM = eligibilityBCM; }
}