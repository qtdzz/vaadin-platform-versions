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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.validation.constraints.NotNull;

import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtdzz.model.PlatformItem;
import com.qtdzz.model.PlatformVersions;
import com.vaadin.connect.VaadinService;
import com.vaadin.connect.auth.AnonymousAllowed;

@VaadinService
@AnonymousAllowed
public class VersionService {

    @NotNull
    public List<PlatformItem> getFlowVersion() {
        PlatformVersions platformVersions = request(
                "https://raw.githubusercontent.com/vaadin/platform/13.0" +
                        ".2/versions.json");
        List<PlatformItem> platformItems = new ArrayList<>();
        if (platformVersions != null) {
            for (Map.Entry<String, PlatformItem> coreItems : platformVersions
                    .getCore().entrySet()) {
                coreItems.getValue().setName(coreItems.getKey());
                platformItems.add(coreItems.getValue());
            }

            for (Map.Entry<String, PlatformItem> proItems : platformVersions
                    .getVaadin().entrySet()) {
                proItems.getValue().setName(proItems.getKey());
                platformItems.add(proItems.getValue());
            }

        }
        return platformItems;
    }

    private PlatformVersions request(String requestUrl) {
        HttpURLConnection con = null;
        try {
            URL url = new URL(requestUrl);
            con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            if (con.getResponseCode() == 200) {
                try (BufferedReader in = new BufferedReader(
                        new InputStreamReader(con.getInputStream()))) {
                    String inputLine;
                    StringBuilder response = new StringBuilder();
                    while ((inputLine = in.readLine()) != null) {
                        response.append(inputLine);
                    }
                    String s = response.toString();
                    return new ObjectMapper()
                            .readValue(s, PlatformVersions.class);
                }
            }
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (ProtocolException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (con != null) {
                con.disconnect();
            }
        }
        return null;
    }
}
