package com.itwizard.swaedu.modules.mastercode.service;

import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodeCreateDto;
import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodePatchDto;
import com.itwizard.swaedu.modules.mastercode.dto.request.MasterCodeUpdateDto;
import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeResponseDto;
import com.itwizard.swaedu.modules.mastercode.dto.response.MasterCodeTreeDto;
import com.itwizard.swaedu.util.PageResponse;

import java.util.List;

public interface MasterCodeService {
    MasterCodeResponseDto createMasterCode(MasterCodeCreateDto request);

    PageResponse<MasterCodeResponseDto> listMasterCodes(String q, Integer page, Integer size, String sort, Long parentId, Boolean rootOnly);

    MasterCodeResponseDto getMasterCodeById(Long id);

    MasterCodeResponseDto updateMasterCode(Long id, MasterCodeUpdateDto request);

    MasterCodeResponseDto patchMasterCode(Long id, MasterCodePatchDto request);

    void deleteMasterCode(Long id);

    PageResponse<MasterCodeResponseDto> listRootMasterCodes(String q, Integer page, Integer size, String sort);

    PageResponse<MasterCodeResponseDto> listChildren(Integer parentCode, String q, Integer page, Integer size, String sort);

    List<MasterCodeTreeDto> getMasterCodeTree(Long rootId, Integer depth);
}
