package com.terappka.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Lombok: tworzy konstruktor dla pól 'final' (wstrzykiwanie zależności)
public class UserService {

    private final UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto createUser(UserDto userDto) {
        User user = User.builder()
                .email(userDto.getEmail())
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .password("tmp123")
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    // Metoda pomocnicza do mapowania Encja -> DTO
    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono uzytkownia o id: " + id));

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());

        User savedUser = userRepository.save(user);

        return mapToDto(savedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Nie znaleziono uzytkownia o id: " + id);
        }

        userRepository.deleteById(id);
    }


}