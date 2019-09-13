package com.qtdzz.platform.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class PlatformVersions {
    Map<String, PlatformItem> core;
    Map<String, PlatformItem> vaadin;
    String platform;
    Map<String, PlatformItem> community;

    public PlatformVersions() {
        // no op
    }

    public PlatformVersions(Map<String, PlatformItem> core,
            Map<String, PlatformItem> vaadin, String platform) {
        this.core = core;
        this.vaadin = vaadin;
        this.platform = platform;
    }

    public Map<String, PlatformItem> getCore() {
        return core;
    }

    public Map<String, PlatformItem> getVaadin() {
        return vaadin;
    }

    public String getPlatform() {
        return platform;
    }

    public Map<String, PlatformItem> getCommunity() {
        return community;
    }

    public void setPlatform(String platformVersion) {
        this.platform = platformVersion;
    }

    public List<PlatformItem> asPlatformItems() {
        List<PlatformItem> platformItems = new ArrayList<>();
        platformItems.addAll(getPlatformItemsFrom(getCore()));
        platformItems.addAll(getPlatformItemsFrom(getVaadin()));
        platformItems.addAll(getPlatformItemsFrom(getCommunity()));
        return platformItems;
    }

    private List<PlatformItem> getPlatformItemsFrom(
            Map<String, PlatformItem> map) {
        if (map == null) {
            return Collections.emptyList();
        }
        List<PlatformItem> platformItems = new ArrayList<>();
        for (Map.Entry<String, PlatformItem> coreItems : map.entrySet()) {
            coreItems.getValue().setName(coreItems.getKey());
            platformItems.add(coreItems.getValue());
        }
        return platformItems;
    }
}
