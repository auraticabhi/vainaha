/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['randomuser.me', 'source.unsplash.com', 'avatars.githubusercontent.com', 'turk.net', 'lh3.googleusercontent.com', 'graph.facebook.com', 'firebasestorage.googleapis.com', 'qph.cf2.quoracdn.net', 'images.rawpixel.com', 'e7.pngegg.com', 'images.unsplash.com', 'img.evbuc.com', 'www.google.com', 'www.adobe.com', 'static.vecteezy.com'],
        // unoptimized: true,
    },
    // distDir: 'build',
    // output: 'export',
    // trailingSlash: true,
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },

    //   output: 'export',
};

export default nextConfig;