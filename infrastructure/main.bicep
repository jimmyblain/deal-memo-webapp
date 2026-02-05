@description('The Azure region for all resources')
param location string = resourceGroup().location

@description('Base name for all resources')
param appName string = 'deal-memo'

@description('Azure AD tenant ID for authentication')
param tenantId string

@description('Azure AD client ID for authentication')
param aadClientId string

@description('Azure OpenAI deployment name')
param openAiDeploymentName string = 'gpt-4o'

// --- Storage Account ---
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: replace('${appName}storage', '-', '')
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource templatesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'templates'
  properties: {
    publicAccess: 'None'
  }
}

// --- Azure OpenAI ---
resource openAi 'Microsoft.CognitiveServices/accounts@2024-04-01-preview' = {
  name: '${appName}-openai'
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'OpenAI'
  properties: {
    customSubDomainName: '${appName}-openai'
    publicNetworkAccess: 'Enabled'
  }
}

resource openAiDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-04-01-preview' = {
  parent: openAi
  name: openAiDeploymentName
  sku: {
    name: 'Standard'
    capacity: 30
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: '2024-08-06'
    }
  }
}

// --- Key Vault ---
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${appName}-kv'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
  }
}

resource openAiKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'azure-openai-api-key'
  properties: {
    value: openAi.listKeys().key1
  }
}

// --- Static Web App ---
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: '${appName}-swa'
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

resource swaAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    AZURE_OPENAI_ENDPOINT: openAi.properties.endpoint
    AZURE_OPENAI_API_KEY: '@Microsoft.KeyVault(SecretUri=${openAiKeySecret.properties.secretUri})'
    AZURE_OPENAI_DEPLOYMENT: openAiDeploymentName
    AAD_CLIENT_ID: aadClientId
  }
}

// --- Application Insights (optional but recommended) ---
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${appName}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${appName}-insights'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// --- Outputs ---
output staticWebAppName string = staticWebApp.name
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output storageAccountName string = storageAccount.name
output openAiEndpoint string = openAi.properties.endpoint
output keyVaultName string = keyVault.name
output appInsightsConnectionString string = appInsights.properties.ConnectionString
