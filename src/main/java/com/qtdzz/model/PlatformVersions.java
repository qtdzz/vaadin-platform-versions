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

import java.util.Map;

public class PlatformVersions {
    Map<String, PlatformItem> core;
    Map<String, PlatformItem> vaadin;
    String platform;
    boolean isDeprecated;
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
}
