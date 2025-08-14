#!/usr/bin/env python3
"""
MobileNet V2 TFLite Model Generator for Face Recognition
This script creates a MobileNet V2 model optimized for mobile devices
that outputs feature embeddings suitable for face recognition.
"""

import tensorflow as tf
# Note: We avoid TensorFlow Hub for better compatibility on Windows/Python 3.13
import numpy as np

def create_mobilenet_face_recognition_model() -> tf.keras.Model:
    """
    Create a MobileNet V2 model optimized for face recognition
    """
    print("🔧 Creating MobileNet V2 Face Recognition Model...")
    
    # Build MobileNetV2 feature extractor using Keras Applications (ImageNet weights)
    
    try:
        # Create a simple model that outputs embeddings (1280-dim)
        input_shape = (224, 224, 3)
        input_tensor = tf.keras.Input(shape=input_shape, name="input_image")

        # Preprocess input (normalize to [-1, 1])
        preprocessed = tf.keras.applications.mobilenet_v2.preprocess_input(input_tensor)

        # Base MobileNetV2 (no classification head)
        base = tf.keras.applications.MobileNetV2(
            input_shape=input_shape,
            include_top=False,
            weights="imagenet",
            input_tensor=preprocessed
        )

        # Global average pooling to produce a 1280-d feature vector
        pooled = tf.keras.layers.GlobalAveragePooling2D(name="global_avg_pool")(base.output)
        embeddings = tf.keras.layers.Lambda(lambda x: x, name="embedding_vector")(pooled)
        
        # Create the final model
        face_recognition_model = tf.keras.Model(
            inputs=input_tensor,
            outputs=embeddings,
            name="mobilenet_v2_face_recognition"
        )
        
        print("✅ Model created successfully!")
        print(f"📊 Input shape: {input_shape}")
        print(f"📊 Output shape: {embeddings.shape}")
        
        return face_recognition_model
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

def convert_to_tflite(model: tf.keras.Model, output_path: str = "android/app/src/main/assets/mobilenet_v2_face_recognition.tflite"):
    """
    Convert the model to TFLite format
    """
    print("🔄 Converting to TFLite format...")
    
    try:
        # Ensure output directory exists
        import os
        out_dir = os.path.dirname(output_path)
        if out_dir and not os.path.exists(out_dir):
            os.makedirs(out_dir, exist_ok=True)

        # Convert to TFLite (float model; optimized)
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        
        # Optimize for mobile
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        # Note: we skip integer quantization for simplicity/compatibility
        # Float model is sufficient and more robust across devices
        
        # Convert
        tflite_model = converter.convert()
        
        # Save the model
        with open(output_path, 'wb') as f:
            f.write(tflite_model)
        
        print(f"✅ TFLite model saved to: {output_path}")
        
        # Get model size
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"📏 Model size: {size_mb:.2f} MB")
        
        return output_path
        
    except Exception as e:
        print(f"❌ Error converting to TFLite: {e}")
        return None

def representative_dataset_gen():
    """
    Representative dataset generator for quantization
    """
    for _ in range(100):
        # Generate random data similar to real images
        data = np.random.random((1, 224, 224, 3)).astype(np.float32)
        yield [data]

def main():
    """
    Main function to generate the TFLite model
    """
    print("🚀 MobileNet V2 Face Recognition Model Generator")
    print("=" * 50)
    
    # Create the model
    model = create_mobilenet_face_recognition_model()
    
    if model is None:
        print("❌ Failed to create model")
        return
    
    # Convert to TFLite directly into Android assets
    output_path = convert_to_tflite(model)
    
    if output_path:
        print("\n🎉 Success! Your TFLite model is ready!")
        print(f"📁 File: {output_path}")
        print("\n📋 Next steps:")
        print("1. Rebuild your app so the new asset is packaged")
        print("2. Test face recognition with real AI!")
    else:
        print("❌ Failed to convert model to TFLite")

if __name__ == "__main__":
    main()
