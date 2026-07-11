package com.example.collegeportal.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "colleges")
public class College {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String name;

    private String shortName;
    private String category;
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    private String city;

    private String state;

    @Column(columnDefinition = "TEXT")
    private String facilities;

    private String website;

    private String contactPhone;

    private String contactEmail;

    private Integer nirf;
    private String accreditation;
    private Integer establishedYear;

    @Column(columnDefinition = "TEXT")
    private String imagePath;
    
    @Column(columnDefinition = "TEXT")
    private String logoPath;

    private Double avgPackage;
    private Double highestPackage;
    private Double placementPercentage;
    private Double minFee;
    private Double maxFee;
    private Integer totalSeats;
    private Double cutoff;
    
    @Column(columnDefinition = "TEXT")
    private String topRecruiters;

    @Column(columnDefinition = "TEXT")
    private String gallery;

    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria;

    private Double rating;

    public College() {}

    public College(Long userId, String name) {
        this.userId = userId;
        this.name = name;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getShortName() { return shortName; }
    public void setShortName(String shortName) { this.shortName = shortName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getFacilities() { return facilities; }
    public void setFacilities(String facilities) { this.facilities = facilities; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public Integer getNirf() { return nirf; }
    public void setNirf(Integer nirf) { this.nirf = nirf; }

    public String getAccreditation() { return accreditation; }
    public void setAccreditation(String accreditation) { this.accreditation = accreditation; }

    public Integer getEstablishedYear() { return establishedYear; }
    public void setEstablishedYear(Integer establishedYear) { this.establishedYear = establishedYear; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getLogoPath() { return logoPath; }
    public void setLogoPath(String logoPath) { this.logoPath = logoPath; }

    public Double getAvgPackage() { return avgPackage; }
    public void setAvgPackage(Double avgPackage) { this.avgPackage = avgPackage; }

    public Double getHighestPackage() { return highestPackage; }
    public void setHighestPackage(Double highestPackage) { this.highestPackage = highestPackage; }

    public Double getPlacementPercentage() { return placementPercentage; }
    public void setPlacementPercentage(Double placementPercentage) { this.placementPercentage = placementPercentage; }

    public Double getMinFee() { return minFee; }
    public void setMinFee(Double minFee) { this.minFee = minFee; }

    public Double getMaxFee() { return maxFee; }
    public void setMaxFee(Double maxFee) { this.maxFee = maxFee; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Double getCutoff() { return cutoff; }
    public void setCutoff(Double cutoff) { this.cutoff = cutoff; }

    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }

    public String getTopRecruiters() { return topRecruiters; }
    public void setTopRecruiters(String topRecruiters) { this.topRecruiters = topRecruiters; }

    public String getGallery() { return gallery; }
    public void setGallery(String gallery) { this.gallery = gallery; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
}
