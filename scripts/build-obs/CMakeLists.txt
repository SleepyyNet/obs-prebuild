cmake_minimum_required(VERSION 3.1)

project(obs-studio-node VERSION 1.0.0)

set(
    OSN_ENABLE_DISTRIBUTION false
    CACHE BOOL "Whether to pull in OBS distribution files"
)

set(
    OBS_BUILD_TYPE "Release"
    CACHE STRING "Configuration of OBS binaries to copy"
)

set(
    OBS_OUT_DIR "${CMAKE_SOURCE_DIR}/out"
    CACHE STRING "Variable controlling where binaries are installed"
)

set(
    OBS_STUDIO_PATH "${CMAKE_SOURCE_DIR}/obs-studio"
    CACHE PATH "Path to 64-bit build directory"
)

set(
    OBS_STUDIO_BUILD64 "${CMAKE_SOURCE_DIR}/obs-build64"
    CACHE PATH "Path to 64-bit build directory"
)

set(
    OBS_STUDIO_DEPS64 "${CMAKE_SOURCE_DIR}/dependencies2015/win64"
    CACHE PATH "Path to 64-bit dependencies for obs studio"
)

if(IS_DIRECTORY ${OBS_STUDIO_PATH})
    message("OBS Studio 64-bit Build Path: ${OBS_STUDIO_BUILD64}")
else()
    message(FATAL_ERROR 
        "Failed to find OBS Studio using OBS_STUDIO_PATH: ${OBS_STUDIO_PATH}"
    )
endif()

add_library(obs SHARED IMPORTED)

if (WIN32)
    set_target_properties(obs PROPERTIES
        IMPORTED_LOCATION_DEBUG "${OBS_STUDIO_BUILD64}/libobs/Debug/obs.dll"
        IMPORTED_IMPLIB_DEBUG "${OBS_STUDIO_BUILD64}/libobs/Debug/obs.lib"

        IMPORTED_LOCATION_RELEASE "${OBS_STUDIO_BUILD64}/libobs/Release/obs.dll"
        IMPORTED_IMPLIB_RELEASE "${OBS_STUDIO_BUILD64}/libobs/Release/obs.lib"

        IMPORTED_LOCATION_RELWITHDEBINFO "${OBS_STUDIO_BUILD64}/libobs/RelWithDebInfo/obs.dll"
        IMPORTED_IMPLIB_RELWITHDEBINFO "${OBS_STUDIO_BUILD64}/libobs/RelWithDebInfo/obs.lib"
    )
    install(
        FILES "${OBS_STUDIO_BUILD64}/libobs/Debug/obs.pdb"
        CONFIGURATIONS Debug
        DESTINATION "${OBS_OUT_DIR}")
elseif()
    message(FATAL_ERROR "Only Windows supported for right now")
endif()

# Just copy all dependencies into a local folder so we can run our tests.
set( OBS_DEPENDENCIES 
    "${OBS_STUDIO_DEPS64}/bin/avcodec-57.dll"
    "${OBS_STUDIO_DEPS64}/bin/avdevice-57.dll"
    "${OBS_STUDIO_DEPS64}/bin/avfilter-6.dll"
    "${OBS_STUDIO_DEPS64}/bin/avformat-57.dll"
    "${OBS_STUDIO_DEPS64}/bin/avutil-55.dll"
    "${OBS_STUDIO_DEPS64}/bin/libcurl.dll"
    "${OBS_STUDIO_DEPS64}/bin/libogg-0.dll"
    "${OBS_STUDIO_DEPS64}/bin/libopus-0.dll"
    "${OBS_STUDIO_DEPS64}/bin/libpng16-16.dll"
    "${OBS_STUDIO_DEPS64}/bin/libvorbis-0.dll"
    "${OBS_STUDIO_DEPS64}/bin/libvorbisenc-2.dll"
    "${OBS_STUDIO_DEPS64}/bin/libvorbisfile-3.dll"
    "${OBS_STUDIO_DEPS64}/bin/libvpx-1.dll"
    "${OBS_STUDIO_DEPS64}/bin/libx264-148.dll"
    "${OBS_STUDIO_DEPS64}/bin/swresample-2.dll"
    "${OBS_STUDIO_DEPS64}/bin/swscale-4.dll"
    "${OBS_STUDIO_DEPS64}/bin/zlib.dll"
    "${OBS_STUDIO_BUILD64}/libobs/${OBS_BUILD_TYPE}/obs.dll"
    "${OBS_STUDIO_BUILD64}/libobs-d3d11/${OBS_BUILD_TYPE}/libobs-d3d11.dll"
    "${OBS_STUDIO_BUILD64}/deps/glad/${OBS_BUILD_TYPE}/obsglad.dll"
    "${OBS_STUDIO_BUILD64}/deps/w32-pthreads/${OBS_BUILD_TYPE}/w32-pthreads.dll"
)


install(
    FILES ${OBS_DEPENDENCIES}
    DESTINATION "${OBS_OUT_DIR}/"
)

function(copy_obs_plugin PLUGIN_NAME)
    install(
        DIRECTORY "${OBS_STUDIO_PATH}/plugins/${PLUGIN_NAME}/data"
        DESTINATION "${OBS_OUT_DIR}/data/obs-plugins/${PLUGIN_NAME}"
    )
    install(
        FILES
        "${OBS_STUDIO_BUILD64}/plugins/${PLUGIN_NAME}/${OBS_BUILD_TYPE}/${PLUGIN_NAME}.dll"
        "${OBS_STUDIO_BUILD64}/plugins/${PLUGIN_NAME}/${OBS_BUILD_TYPE}/${PLUGIN_NAME}.pdb"
        DESTINATION "${OBS_OUT_DIR}/obs-plugins"
    )
endfunction()

file(GLOB DATA_LIBOBS
    "${OBS_STUDIO_PATH}/libobs/data/*")

install(
    FILES ${DATA_LIBOBS}
    DESTINATION "${OBS_OUT_DIR}/data/libobs"
)

copy_obs_plugin("image-source")
copy_obs_plugin("obs-ffmpeg")
copy_obs_plugin("obs-filters")
copy_obs_plugin("obs-outputs")
copy_obs_plugin("obs-qsv11")
copy_obs_plugin("obs-text")
copy_obs_plugin("obs-transitions")
copy_obs_plugin("obs-x264")
copy_obs_plugin("rtmp-services")
copy_obs_plugin("text-freetype2")
copy_obs_plugin("win-capture")
copy_obs_plugin("win-dshow")
copy_obs_plugin("win-mf")
copy_obs_plugin("win-wasapi")

install(
    FILES ${MISC_FILES}
    DESTINATION "${OBS_OUT_DIR}"
)