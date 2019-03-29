/*******************************************************************************
 * Vaadin Designer
 *
 * Copyright (C) 2015 Vaadin Ltd
 *
 * This program is available under Commercial Vaadin Add-On License 3.0 (CVALv3).
 *
 * For more details, see https://vaadin.com/license/cval-3
 *******************************************************************************/
package com.qtdzz.model;

import java.util.List;

import javax.validation.constraints.NotNull;

public class PlatformItemsResult {

    @NotNull
    private String platformVersion;
    @NotNull
    private List<PlatformItem> platformItems;

    public PlatformItemsResult(String platformVersion,
            List<PlatformItem> platformItems) {
        this.platformVersion = platformVersion;
        this.platformItems = platformItems;
    }

    public String getPlatformVersion() {
        return platformVersion;
    }

    public void setPlatformVersion(String platformVersion) {
        this.platformVersion = platformVersion;
    }

    public List<PlatformItem> getPlatformItems() {
        return platformItems;
    }

    public void setPlatformItems(List<PlatformItem> platformItems) {
        this.platformItems = platformItems;
    }
}
