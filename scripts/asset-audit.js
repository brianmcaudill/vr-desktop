#!/usr/bin/env node

/**
 * Asset Audit Scanner
 * Finds duplicate binary assets (images, fonts, media) using MD5 hashing
 *
 * Usage: node asset-audit.js [directory] [options]
 * Options:
 *   --min-size=1000     Minimum file size in bytes (default: 100)
 *   --exclude=pattern   Patterns to exclude (can be used multiple times)
 *   --json              Output as JSON
 *   --verbose           Show detailed output
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AssetAudit {
  constructor(options = {}) {
    this.options = {
      minSize: options.minSize || 100,
      excludePatterns: options.exclude || [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
        'coverage',
      ],
      verbose: options.verbose || false,
      json: options.json || false,
      extensions: options.extensions || [
        // Images
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.webp',
        '.ico',
        '.avif',
        // Fonts
        '.woff',
        '.woff2',
        '.ttf',
        '.eot',
        '.otf',
        // Media
        '.mp4',
        '.webm',
        '.mp3',
        '.wav',
        // Documents
        '.pdf',
      ],
    };

    this.filesByHash = new Map();
    this.processedFiles = 0;
    this.totalFiles = 0;
  }

  /**
   * Calculate MD5 hash of file content (binary-safe)
   * @param {string} filePath - Path to file
   * @returns {string|null} - MD5 hash or null on error
   */
  getFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath); // No encoding = raw Buffer
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      if (this.options.verbose) {
        console.error(`Error reading ${filePath}: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Check if path should be excluded
   * @param {string} filePath - Path to check
   * @returns {boolean}
   */
  shouldExclude(filePath) {
    return this.options.excludePatterns.some(
      (pattern) =>
        filePath.includes(pattern) ||
        filePath.includes(path.sep + pattern + path.sep)
    );
  }

  /**
   * Check if file has valid extension
   * @param {string} filePath - Path to check
   * @returns {boolean}
   */
  hasValidExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.options.extensions.includes(ext);
  }

  /**
   * Recursively scan directory for assets
   * @param {string} dir - Directory to scan
   * @param {string|null} baseDir - Base directory for relative paths
   */
  scanDirectory(dir, baseDir = null) {
    if (!baseDir) baseDir = dir;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (this.shouldExclude(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          this.scanDirectory(fullPath, baseDir);
        } else if (entry.isFile() && this.hasValidExtension(entry.name)) {
          this.totalFiles++;
          const stats = fs.statSync(fullPath);

          if (stats.size >= this.options.minSize) {
            this.processFile(fullPath, relativePath, stats);
          }
        }
      }
    } catch (error) {
      if (this.options.verbose) {
        console.error(`Error scanning directory ${dir}: ${error.message}`);
      }
    }
  }

  /**
   * Process individual file - calculate hash and store
   * @param {string} fullPath - Full path to file
   * @param {string} relativePath - Relative path for display
   * @param {fs.Stats} stats - File stats
   */
  processFile(fullPath, relativePath, stats) {
    this.processedFiles++;

    if (this.options.verbose && this.processedFiles % 100 === 0) {
      process.stdout.write(
        `\rProcessing files: ${this.processedFiles}/${this.totalFiles}`
      );
    }

    const hash = this.getFileHash(fullPath);
    if (hash) {
      if (!this.filesByHash.has(hash)) {
        this.filesByHash.set(hash, []);
      }
      this.filesByHash.get(hash).push({
        path: fullPath,
        relativePath: relativePath,
        size: stats.size,
        extension: path.extname(fullPath).toLowerCase(),
      });
    }
  }

  /**
   * Analyze directory for duplicate assets
   * @param {string} directory - Directory to analyze
   * @returns {object} - Analysis results
   */
  analyze(directory) {
    console.log(`\n🔍 Scanning for duplicate assets in: ${directory}\n`);

    this.scanDirectory(directory);

    if (this.options.verbose) {
      console.log(`\n✅ Processed ${this.processedFiles} files\n`);
    }

    const duplicateGroups = [];
    let totalWastedBytes = 0;

    for (const [hash, files] of this.filesByHash.entries()) {
      if (files.length > 1) {
        const wastedBytes = files[0].size * (files.length - 1);
        totalWastedBytes += wastedBytes;

        duplicateGroups.push({
          hash: hash,
          count: files.length,
          fileSize: files[0].size,
          wastedBytes: wastedBytes,
          extension: files[0].extension,
          files: files.map((f) => f.relativePath),
        });
      }
    }

    // Sort by wasted space (largest first)
    duplicateGroups.sort((a, b) => b.wastedBytes - a.wastedBytes);

    const stats = {
      totalFilesScanned: this.totalFiles,
      totalFilesProcessed: this.processedFiles,
      uniqueFiles: this.filesByHash.size,
      duplicateGroups: duplicateGroups.length,
      totalDuplicates: duplicateGroups.reduce((acc, g) => acc + g.count - 1, 0),
      totalWastedBytes: totalWastedBytes,
    };

    return {
      stats,
      duplicateGroups,
    };
  }

  /**
   * Format bytes to human readable
   * @param {number} bytes - Bytes to format
   * @returns {string}
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Print results to console
   * @param {object} results - Analysis results
   */
  printResults(results) {
    if (this.options.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    console.log(
      '═══════════════════════════════════════════════════════════════'
    );
    console.log(
      '                     📊 ASSET AUDIT RESULTS'
    );
    console.log(
      '═══════════════════════════════════════════════════════════════'
    );
    console.log(`Total assets scanned:    ${results.stats.totalFilesScanned}`);
    console.log(`Assets processed:        ${results.stats.totalFilesProcessed}`);
    console.log(`Unique assets:           ${results.stats.uniqueFiles}`);
    console.log(`Duplicate groups:        ${results.stats.duplicateGroups}`);
    console.log(`Total duplicates:        ${results.stats.totalDuplicates}`);
    console.log(
      `Wasted space:            ${this.formatBytes(results.stats.totalWastedBytes)}`
    );
    console.log();

    if (results.duplicateGroups.length > 0) {
      console.log(
        '═══════════════════════════════════════════════════════════════'
      );
      console.log(
        '                   🔁 DUPLICATE ASSETS'
      );
      console.log(
        '═══════════════════════════════════════════════════════════════'
      );

      results.duplicateGroups.slice(0, 20).forEach((group, index) => {
        console.log(
          `\n${index + 1}. ${group.extension} (${group.count} copies, ${this.formatBytes(group.wastedBytes)} wasted)`
        );
        group.files.forEach((file) => {
          console.log(`   📄 ${file}`);
        });
      });

      if (results.duplicateGroups.length > 20) {
        console.log(
          `\n... and ${results.duplicateGroups.length - 20} more duplicate groups`
        );
      }
    } else {
      console.log('✅ No duplicate assets found!');
    }

    console.log(
      '\n═══════════════════════════════════════════════════════════════'
    );
  }
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Asset Audit Scanner
Finds duplicate binary assets (images, fonts, media) using MD5 hashing

Usage: node asset-audit.js [directory] [options]

Options:
  --min-size=NUMBER     Minimum file size in bytes (default: 100)
  --exclude=PATTERN     Patterns to exclude (can be used multiple times)
  --json                Output as JSON
  --verbose             Show detailed output
  --help                Show this help message

Examples:
  node asset-audit.js .
  node asset-audit.js ./public --min-size=1000
  node asset-audit.js . --exclude=test --exclude=.cache
  node asset-audit.js . --json
    `);
    process.exit(0);
  }

  const directory = args[0].startsWith('--') ? '.' : args[0];
  const options = {};

  args.forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');

      switch (key) {
        case 'min-size':
          options.minSize = parseInt(value) || 100;
          break;
        case 'exclude':
          if (!options.exclude) options.exclude = [];
          options.exclude.push(value);
          break;
        case 'json':
          options.json = true;
          break;
        case 'verbose':
          options.verbose = true;
          break;
      }
    }
  });

  // Add default excludes if not specified
  if (!options.exclude) {
    options.exclude = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
    ];
  }

  const scanner = new AssetAudit(options);
  const results = scanner.analyze(path.resolve(directory));
  scanner.printResults(results);
}

if (require.main === module) {
  main();
}

module.exports = AssetAudit;
