package com.itwizard.swaedu.util;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder(toBuilder = true)
public class TokenGenerateParam {
    @Builder.Default
    private String ip = "";

    @Builder.Default
    private String userAgent = "unknown";
}
