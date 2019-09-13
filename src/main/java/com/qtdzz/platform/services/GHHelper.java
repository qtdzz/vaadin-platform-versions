package com.qtdzz.platform.services;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.io.IOUtils;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GHTag;
import org.kohsuke.github.GitHub;
import org.kohsuke.github.GitHubBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GHHelper {
    private static GitHub INSTANCE;
    private static GHRepository PLATFORM;
    private static final String PLATFORM_REPOSITORY = "vaadin/platform";
    private static final String VERSIONS_JSON_PATH = "versions.json";

    static {
        try {
            INSTANCE = GitHubBuilder.fromCredentials().build();
            PLATFORM = INSTANCE.getRepository(PLATFORM_REPOSITORY);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Can't find gh credential in ~/.github");
        }
    }

    public static List<GHTag> getTags() {
        try {
            return PLATFORM.listTags().asList();
        } catch (IOException e) {
            getLogger().error("Can't get tags", e);
            return Collections.emptyList();
        }
    }

    private static Logger getLogger() {
        return LoggerFactory.getLogger(GHHelper.class);
    }

    public static String getLatestRelease() {
        try {
            return PLATFORM.getLatestRelease().getTagName();
        } catch (IOException e) {
            getLogger().error("Can't get latest release", e);
            return null;
        }
    }

    public static String getVersionsJson(String version) {
        try {
            return IOUtils.toString(
                    PLATFORM.getFileContent(VERSIONS_JSON_PATH, version)
                            .read());
        } catch (IOException e) {
            return null;
        }
    }

    public static List<String> getReleases() {
        try {
            return PLATFORM.listTags().asList().stream()
                    .map(GHTag::getName).collect(Collectors.toList());
        } catch (IOException e) {
            getLogger().error("Can't get releases", e);
            return Collections.emptyList();
        }
    }
}
