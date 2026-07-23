# Use a lightweight web server
FROM nginx:alpine

# Copy project files into nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80
