package com.organica.payload;

import lombok.Data;

@Data
public class ProductCreateDto {
    private String productName;
    private String description;
    private Float price;
    private Float weight;
}
