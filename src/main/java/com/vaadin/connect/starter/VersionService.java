/*******************************************************************************
 * Vaadin Designer
 *
 * Copyright (C) 2015 Vaadin Ltd
 *
 * This program is available under Commercial Vaadin Add-On License 3.0 (CVALv3).
 *
 * For more details, see https://vaadin.com/license/cval-3
 *******************************************************************************/
package com.vaadin.connect.starter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import javax.validation.constraints.NotNull;

import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtdzz.model.PlatformItem;
import com.qtdzz.model.PlatformItemsResult;
import com.qtdzz.model.PlatformVersions;
import com.vaadin.connect.VaadinService;
import com.vaadin.connect.auth.AnonymousAllowed;

@VaadinService
@AnonymousAllowed
public class VersionService {

    @NotNull
    public PlatformItemsResult getVersionsFromLatestRelease() {
        return getVersionsIn(GHHelper.getLatestRelease());
    }

    @NotNull
    public List<String> getReleases() {
        return GHHelper.getReleases();
    }

    @NotNull
    public String getLatestVersion() {
        return GHHelper.getLatestRelease();
    }

    @NotNull
    public PlatformItemsResult getVersionsIn(String version) {
        PlatformVersions platformVersions = getPlatformVersions(version);
        List<PlatformItem> platformItems = constructPlatformItems(
                platformVersions);
        return new PlatformItemsResult(version, platformItems);
    }

    private List<PlatformItem> constructPlatformItems(
            PlatformVersions platformVersionsObject) {
        if (platformVersionsObject == null) {
            return Collections.emptyList();
        }
        return platformVersionsObject.asPlatformItems();
    }

    private PlatformVersions getPlatformVersions(String version) {
        String versions = GHHelper.getVersionsJson(version);
        try {
            PlatformVersions platformVersions = new ObjectMapper()
                    .readValue(versions, PlatformVersions.class);
            platformVersions.setPlatform(version);
            return platformVersions;
        } catch (IOException e) {
            LoggerFactory.getLogger(VersionService.class)
                    .error("Can't get platform versions.json", e);
            return null;
        }
    }
}
