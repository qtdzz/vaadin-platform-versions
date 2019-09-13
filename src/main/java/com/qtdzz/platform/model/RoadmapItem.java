package com.qtdzz.platform.model;

public class RoadmapItem {
    private int major;
    private String gaDate;
    private String endDate;
    private boolean isLTS;
    private String extendedDate;


    public int getMajor() {
        return major;
    }

    public void setMajor(int major) {
        this.major = major;
    }

    public String getGaDate() {
        return gaDate;
    }

    public void setGaDate(String gaDate) {
        this.gaDate = gaDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public boolean isIsLTS() {
        return isLTS;
    }

    public void setIsLTS(boolean LTS) {
        isLTS = LTS;
    }

    public String getExtendedDate() {
        return extendedDate;
    }

    public void setExtendedDate(String extendedDate) {
        this.extendedDate = extendedDate;
    }
}
