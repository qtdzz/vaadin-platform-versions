package com.qtdzz.platform.model;

import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.fasterxml.jackson.annotation.JsonCreator;

public class PlatformItem {
    private String name;
    private String javaVersion;
    private String npmName;
    private String npmVersion;
    private String bowerVersion;
    private boolean isComponent;
    private boolean isPro;

    public PlatformItem() {
    }

    public PlatformItem(String javaVersion, String npmName, String npmVersion,
            String bowerVersion, boolean isPro, boolean isComponent) {
        this.javaVersion = javaVersion;
        this.npmName = npmName;
        this.npmVersion = npmVersion;
        this.bowerVersion = bowerVersion;
        this.isPro = isPro;
        this.isComponent = isComponent;
    }

    public String getJavaVersion() {
        return javaVersion;
    }

    public String getNpmName() {
        return npmName;
    }

    public String getNpmVersion() {
        return npmVersion;
    }

    public String getBowerVersion() {
        return bowerVersion;
    }

    public boolean isComponent() {
        return isComponent;
    }

    public boolean isPro() {
        return isPro;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setJavaVersion(String javaVersion) {
        this.javaVersion = javaVersion;
    }

    public void setNpmName(String npmName) {
        this.npmName = npmName;
    }

    public void setNpmVersion(String npmVersion) {
        this.npmVersion = npmVersion;
    }

    public void setBowerVersion(String bowerVersion) {
        this.bowerVersion = bowerVersion;
    }

    public void setComponent(boolean component) {
        isComponent = component;
    }

    public void setPro(boolean pro) {
        isPro = pro;
    }

    @JsonCreator
    public static PlatformItem factory(Map<String, Object> props) {
        String javaVersion = (String) props.get("javaVersion");
        String npmName = (String) props.get("npmName");
        String npmVersion = (String) props.get("npmVersion");
        String bowerVersion = (String) props.get("jsVersion");
        boolean isComponent = props.get("component") == null ? false
                : (Boolean) props.get("component");
        boolean isPro =
                props.get("pro") == null ? false : (Boolean) props.get("pro");
        if (StringUtils.isNotBlank(npmName)) {
            npmVersion = StringUtils.firstNonBlank(npmVersion, bowerVersion);
        }
        return new PlatformItem(javaVersion, npmName, npmVersion, bowerVersion,
                isPro, isComponent);
    }
}
