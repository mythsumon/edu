package com.itwizard.swaedu.modules.auth.service;

import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        // Clear sensitive information before returning
        user.setPassword(null);
        return user;
    }
}

