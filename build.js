import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const entryPoints = {
  'src/index.js': 'index',
  'src/reactive/signals.js': 'reactive'
};

async function build() {
  console.log('🔨 Building DOMUtils Library...\n');

  try {
    // Crear directorio dist si no existe
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }

    // ESM builds
    console.log('📦 Building ESM modules...');
    for (const [input, output] of Object.entries(entryPoints)) {
      if (!fs.existsSync(input)) {
        console.warn(`⚠️  Skipping ${input} (not found)`);
        continue;
      }

      await esbuild.build({
        entryPoints: [input],
        outfile: `dist/${output}.esm.js`,
        format: 'esm',
        bundle: false,
        minify: true,
        sourcemap: true,
        logLevel: 'warning'
      });
      console.log(`  ✓ dist/${output}.esm.js`);
    }

    // CJS builds
    console.log('\n📦 Building CJS modules...');
    for (const [input, output] of Object.entries(entryPoints)) {
      if (!fs.existsSync(input)) continue;

      await esbuild.build({
        entryPoints: [input],
        outfile: `dist/${output}.cjs`,
        format: 'cjs',
        bundle: false,
        minify: true,
        sourcemap: true,
        logLevel: 'warning'
      });
      console.log(`  ✓ dist/${output}.cjs`);
    }

    // Copy .d.ts files
    console.log('\n📋 Copying TypeScript definitions...');
    const dtsFiles = [
      'src/index.d.ts',
      'src/reactive/signals.d.ts'
    ];

    for (const file of dtsFiles) {
      if (fs.existsSync(file)) {
        const filename = path.basename(file);
        fs.copyFileSync(file, `dist/${filename}`);
        console.log(`  ✓ dist/${filename}`);
      }
    }

    // Get file sizes
    console.log('\n📊 Bundle sizes:');
    const files = [
      'dist/index.esm.js',
      'dist/index.cjs',
      'dist/reactive.esm.js',
      'dist/reactive.cjs'
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        const stat = fs.statSync(file);
        const size = (stat.size / 1024).toFixed(2);
        console.log(`  ${file}: ${size}KB`);
      }
    }

    console.log('\n✅ Build complete!\n');
  } catch (err) {
    console.error('❌ Build failed:\n', err);
    process.exit(1);
  }
}

build();