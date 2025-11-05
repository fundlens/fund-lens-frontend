output "static_web_app_name" {
  value = azurerm_static_web_app.main.name
}

output "static_web_app_id" {
  value = azurerm_static_web_app.main.id
}

output "static_web_app_api_key" {
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}
