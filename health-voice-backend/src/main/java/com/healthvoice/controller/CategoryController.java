package com.healthvoice.controller;

import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.entity.Category;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/categories", "/api/v1/categories"})
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục thành công", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết danh mục thành công", category));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Category category) {
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        Category saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo danh mục thành công", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Integer id, @RequestBody Category updated) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (updated.getName() != null) category.setName(updated.getName());
        if (updated.getCode() != null) category.setCode(updated.getCode());
        if (updated.getDescription() != null) category.setDescription(updated.getDescription());
        if (updated.getIsActive() != null) category.setIsActive(updated.getIsActive());
        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
    }
}
