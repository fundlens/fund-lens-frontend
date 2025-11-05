data "azurerm_resource_group" "existing" {
  name = var.existing_rg_name
}

resource "azurerm_static_web_app" "main" {
  name                = "fund-lens-frontend"
  resource_group_name = data.azurerm_resource_group.existing.name
  location            = data.azurerm_resource_group.existing.location
}

