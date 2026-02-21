import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

async function generateHeaderImage() {
  console.log('Generating header image for Buddhist temple donation form...');

  const zai = await ZAI.create();

  const response = await zai.images.generations.create({
    prompt: 'Traditional Laotian Buddhist temple scene: Laotian women dressed in traditional silk sinh-malay sitting gracefully making offerings to standing monks who receive them in alms bowls. The women are in elegant traditional clothing with intricate patterns, offering flowers and food. Peaceful morning light, temple courtyard with golden spires in background. Warm golden tones, spiritual atmosphere, respectful devotional scene. High quality, detailed, traditional Southeast Asian Buddhist art style.',
    size: '1440x720'
  });

  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');

  const outputPath = path.join(process.cwd(), 'public', 'donation-header.jpg');
  
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✓ Header image saved to ${outputPath}`);
  return outputPath;
}

generateHeaderImage().catch(console.error);
