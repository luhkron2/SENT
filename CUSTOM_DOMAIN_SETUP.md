# Custom Domain Setup - SE Repairs

**Domain**: www.serepairs.com.au  
**Status**: Pre-configured in vercel.json ✅

---

## 🌐 Add Domain to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project: **senationaltruckrepair**
3. Click on **Settings** tab
4. Click on **Domains** in the left sidebar

### Step 2: Add Your Domain
1. Click **Add Domain** button
2. Enter: `serepairs.com.au`
3. Click **Add**
4. Vercel will show DNS configuration needed

### Step 3: Add www Subdomain
1. Click **Add Domain** again
2. Enter: `www.serepairs.com.au`
3. Click **Add**
4. Vercel will show additional DNS records

---

## 📝 DNS Configuration

You need to add these DNS records to your domain registrar:

### For Root Domain (serepairs.com.au)

**Option A: Using A Records (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Option B: Using CNAME with ALIAS/ANAME**
```
Type: CNAME (or ALIAS/ANAME)
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

### For www Subdomain (www.serepairs.com.au)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## 🔧 Where to Add DNS Records

Based on your domain registrar, log in to:

### Common Australian Registrars:

**Crazy Domains**
1. Log in to https://www.crazydomains.com.au
2. Go to "My Products"
3. Select domain
4. Click "DNS Settings"
5. Add records above

**GoDaddy**
1. Log in to https://www.godaddy.com
2. Go to "My Products"
3. Select domain
4. Click "Manage DNS"
5. Add records above

**Ventraip**
1. Log in to https://ventraip.com.au
2. Go to "My Services"
3. Select domain
4. Click "Manage"
5. Add DNS records

**Netregistry**
1. Log in to https://www.netregistry.com.au
2. Go to "Domain Names"
3. Select domain
4. Click "Manage DNS"
5. Add records above

---

## ✅ Verification Steps

### 1. Add DNS Records (at your registrar)
- Add A record for root domain
- Add CNAME record for www subdomain

### 2. Wait for DNS Propagation
- Usually takes 5-60 minutes
- Can take up to 24-48 hours in some cases

### 3. Check Vercel Dashboard
- Go back to Vercel → Settings → Domains
- Status should change from "Invalid Configuration" to "Valid Configuration"
- You'll see a green checkmark ✅ when ready

### 4. Test Your Domain
```bash
# Check if DNS is propagated
nslookup serepairs.com.au
nslookup www.serepairs.com.au

# Or use online tool
# https://dnschecker.org
```

---

## 🔒 SSL Certificate (Automatic)

Vercel automatically provisions SSL certificates for your domains:

- ✅ Free SSL from Let's Encrypt
- ✅ Auto-renewal every 90 days
- ✅ HTTPS enabled by default
- ✅ HTTP → HTTPS redirect automatic

**No action needed** - this happens automatically once DNS is configured!

---

## 🔀 Domain Redirect Configuration

### Option 1: Redirect Root to www (Recommended)
```
serepairs.com.au → www.serepairs.com.au
```

**In Vercel Dashboard:**
1. Go to Settings → Domains
2. Click on `serepairs.com.au`
3. Select "Redirect to www.serepairs.com.au"
4. Save

### Option 2: Redirect www to Root
```
www.serepairs.com.au → serepairs.com.au
```

**In Vercel Dashboard:**
1. Go to Settings → Domains
2. Click on `www.serepairs.com.au`
3. Select "Redirect to serepairs.com.au"
4. Update NEXTAUTH_URL in vercel.json to match

---

## 🌍 Update Environment Variables

After domain is active, update these in Vercel:

### Go to Settings → Environment Variables

**Update**:
```bash
NEXTAUTH_URL=https://www.serepairs.com.au
```

Or if using root domain:
```bash
NEXTAUTH_URL=https://serepairs.com.au
```

**Then redeploy** for changes to take effect.

---

## 🧪 Testing Your Custom Domain

### 1. Test Domain Accessibility
```bash
# Visit in browser
https://www.serepairs.com.au
https://serepairs.com.au

# Both should work (one will redirect based on your config)
```

### 2. Test HTTPS
- ✅ Green padlock icon in browser
- ✅ Valid SSL certificate
- ✅ No mixed content warnings

### 3. Test Authentication
1. Visit https://www.serepairs.com.au
2. Try logging in
3. Should work without CORS errors

### 4. Test All Features
- ✅ Report form submission
- ✅ File uploads
- ✅ API endpoints
- ✅ Navigation
- ✅ Push notifications

---

## ⚠️ Troubleshooting

### Domain Shows "Invalid Configuration"
**Cause**: DNS not propagated yet  
**Fix**: Wait 5-60 minutes, check DNS with `nslookup`

### SSL Certificate Pending
**Cause**: Domain verification pending  
**Fix**: Ensure DNS records correct, wait for propagation

### Authentication Errors
**Cause**: NEXTAUTH_URL mismatch  
**Fix**: Update environment variable to match your domain

### API Routes Return 404
**Cause**: Framework preset incorrect  
**Fix**: Ensure `vercel.json` has `"framework": "nextjs"`

### Redirect Loop
**Cause**: Multiple redirects configured  
**Fix**: Check domain redirect settings, ensure only one redirect

---

## 📋 Quick Checklist

- [ ] Add domain in Vercel Dashboard
- [ ] Add DNS A record for root domain
- [ ] Add DNS CNAME for www subdomain
- [ ] Wait for DNS propagation (check with nslookup)
- [ ] Verify green checkmark in Vercel
- [ ] Configure domain redirect preference
- [ ] Update NEXTAUTH_URL if needed
- [ ] Redeploy project
- [ ] Test domain in browser
- [ ] Verify SSL certificate
- [ ] Test authentication
- [ ] Test all features

---

## 🎯 Expected Result

After completing all steps:

✅ **https://www.serepairs.com.au** → Your app  
✅ **https://serepairs.com.au** → Redirects to www (or vice versa)  
✅ **http://** → Auto-redirects to https://  
✅ Green padlock (valid SSL)  
✅ All features working  
✅ Authentication working  
✅ No CORS errors  

---

## 🆘 Need Help?

### Check DNS Propagation
Visit: https://dnschecker.org  
Enter: `serepairs.com.au`

### Check SSL Certificate
Visit: https://www.ssllabs.com/ssltest/  
Enter: `www.serepairs.com.au`

### Vercel Support
Visit: https://vercel.com/support  
Or check docs: https://vercel.com/docs/concepts/projects/domains

---

## 📞 Your Current Configuration

**Domain**: serepairs.com.au  
**Subdomain**: www.serepairs.com.au  
**NEXTAUTH_URL**: https://www.serepairs.com.au ✅  
**Framework**: Next.js ✅  
**SSL**: Automatic (Vercel) ✅

**Status**: Ready to add domain once DNS is configured!

---

**Last Updated**: January 6, 2026  
**Version**: 2.1.0  
**Domain Setup**: Ready ✅
