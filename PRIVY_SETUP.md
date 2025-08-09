# Privy Integration Setup Guide

## Overview
NoorooFi now includes Privy authentication integration, allowing users to:
- Login with email (OTP verification)
- Connect external wallets
- Automatically create embedded wallets
- Manage authentication state across the app

## Setup Instructions

### 1. Get Your Privy App ID
1. Visit [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app or use an existing one
3. Copy your App ID from the dashboard

### 2. Configure Environment Variables
Edit `.env.local` file and replace the placeholder:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=your-actual-privy-app-id-here
```

### 3. Configure Privy Settings (Optional)
In `src/components/providers/privy-provider.jsx`, you can customize:
- Login methods (email, wallet, socials)
- Theme and appearance
- Embedded wallet creation settings

## Features Implemented

### 🔑 **Authentication Methods**
- **Email Login**: OTP-based authentication via email
- **Wallet Connect**: Connect external wallets (MetaMask, etc.)
- **Embedded Wallets**: Auto-created for users without wallets

### 🎨 **UI Components**
- **Responsive Design**: Works on desktop and mobile
- **Orange Theme Integration**: Matches NoorooFi brand colors
- **User Info Display**: Shows email and wallet address when logged in
- **Loading States**: Proper loading indicators for async operations

### 📱 **Mobile Support**
- **Compact Login**: Simplified UI for smaller screens
- **Touch-Friendly**: Optimized button sizes and spacing
- **Responsive Layout**: Adapts to different screen sizes

## Usage Examples

### Check Authentication State
```jsx
import { usePrivy } from '@privy-io/react-auth';

function MyComponent() {
  const { ready, authenticated, user } = usePrivy();
  
  if (!ready) return <div>Loading...</div>;
  if (!authenticated) return <div>Please log in</div>;
  
  return <div>Welcome, {user.email?.address}!</div>;
}
```

### Send Transactions (for authenticated users)
```jsx
import { useSendTransaction } from '@privy-io/react-auth';

function SendTransaction() {
  const { sendTransaction } = useSendTransaction();
  
  const handleSend = async () => {
    await sendTransaction({
      to: '0xE3070d3e4309afA3bC9a6b057685743CF42da77C',
      value: 100000 // Wei
    });
  };
  
  return <button onClick={handleSend}>Send Transaction</button>;
}
```

## Security Considerations

1. **Environment Variables**: Keep your Privy App ID secure
2. **HTTPS**: Ensure your production app uses HTTPS
3. **Wallet Permissions**: Users control their wallet permissions
4. **Data Privacy**: Privy handles user data securely

## Troubleshooting

### Common Issues
1. **"Privy not ready"**: Ensure PrivyProvider wraps your app
2. **Invalid App ID**: Check your .env.local configuration
3. **Network Errors**: Verify internet connection and Privy service status

### Support
- [Privy Documentation](https://docs.privy.io)
- [Privy Discord](https://discord.gg/privy)
- [GitHub Issues](https://github.com/privy-io/privy-js)

## Next Steps
- Configure additional login methods (Google, Twitter, etc.)
- Implement transaction history tracking
- Add multi-chain wallet support
- Integrate with prediction market contracts
