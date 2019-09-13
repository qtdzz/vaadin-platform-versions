/*******************************************************************************
 * Vaadin Designer
 *
 * Copyright (C) 2015 Vaadin Ltd
 *
 * This program is available under Commercial Vaadin Add-On License 3.0 (CVALv3).
 *
 * For more details, see https://vaadin.com/license/cval-3
 *******************************************************************************/
package com.qtdzz.platform.services;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtdzz.platform.model.PlatformItem;
import com.qtdzz.platform.model.PlatformItemsResult;
import com.qtdzz.platform.model.PlatformVersions;
import com.qtdzz.platform.model.RoadmapItem;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.vaadin.connect.VaadinService;
import com.vaadin.connect.auth.AnonymousAllowed;

@VaadinService
@AnonymousAllowed
public class VersionService {
    private static final String ROAD_MAP_FILE = "roadmap.json";

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
        String platFormVersion = version;
        if (StringUtils.equalsIgnoreCase(version, "latest")) {
            platFormVersion = getLatestVersion();
        }
        PlatformVersions platformVersions = getPlatformVersions(platFormVersion);
        List<PlatformItem> platformItems = constructPlatformItems(
                platformVersions);
        return new PlatformItemsResult(platFormVersion, platformItems);
    }

    @NotNull
    public List<RoadmapItem> getRoadmap() {
        InputStream resourceAsStream = getClass().getResourceAsStream(ROAD_MAP_FILE);
        if (resourceAsStream == null) {
            getLogger().info("roadmap.json file is not found");
            return Collections.emptyList();
        }
        try {
            String content = IOUtils.toString(resourceAsStream);
            RoadmapItem[] roadmapItems = new ObjectMapper().readValue(content, RoadmapItem[].class);
            return Arrays.asList(roadmapItems);
        } catch (IOException e) {
            getLogger().info("Can't get roadmap file.");
            return Collections.emptyList();
        }
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
            getLogger()
                    .error("Can't get platform versions.json", e);
            return null;
        }
    }

    private static Logger getLogger() {
        return LoggerFactory.getLogger(VersionService.class);
    }
}
