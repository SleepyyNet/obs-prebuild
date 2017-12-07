#pragma once 

#include <stddef.h>

struct memcpy_environment;

struct memcpy_environment *init_threaded_memcpy_pool(unsigned int threads);
void destroy_threaded_memcpy_pool(struct memcpy_environment *env);

void threaded_memcpy(
	void *destination, 
	void *source, 
	size_t size,
	struct memcpy_environment *env);