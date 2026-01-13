package com.itwizard.swaedu.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class JwtPayload {
    private String username;
    private String role;
}

