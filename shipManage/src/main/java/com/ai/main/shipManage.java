package com.ai.main;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan(basePackages={"com"})
@MapperScan(basePackages= "com.ai")
@SpringBootApplication
public class shipManage {
	public static void main(String[] args) {
		SpringApplication.run(shipManage.class, args);
	}
}
