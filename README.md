# Geo Similarity Finder Project

## Author
Iñaki Luque Pastor

## Description
This project is a web map application in which is possible to find similar regions based on the user selection.

## Project Structure

### API webservice
An API webservice has been created using fastAPI for allowing to processing the geometries selected and predict the similities between two geomtries

- **geoProcessSelectedRegion**: This endpoint is in charge of extracting and clipping the region from the Google Maps satellite basemap based on the geometry based in the request parammter
- **findSimilarRegions**: This endpoint is in charge of based on two images (previously clipped by the geoProcessSelectedRegion) detect the regions present in one image (regionOfInterest) that are similar to the other image (regionToPredict)
