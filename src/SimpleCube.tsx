import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export default function CityScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // =====================================
    // Scene
    // =====================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd9d9d9);
    scene.fog = new THREE.Fog(0xd9d9d9, 40000, 140000);

    // =====================================
    // Camera（适配超大城市模型）
    // =====================================
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      50,
      150000
    );

    camera.position.set(18000, 14000, 22000);

    // =====================================
    // Renderer（大场景防闪烁关键）
    // =====================================
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      logarithmicDepthBuffer: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // =====================================
    // Controls
    // =====================================
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.minDistance = 1000;
    controls.maxDistance = 90000;

    controls.maxPolarAngle = Math.PI / 2.05;

    // =====================================
    // Light
    // =====================================

    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(ambientLight);

    // 主太阳光
    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(20000, 30000, 10000);
    dirLight.castShadow = true;

    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 1000;
    dirLight.shadow.camera.far = 80000;
    dirLight.shadow.camera.left = -30000;
    dirLight.shadow.camera.right = 30000;
    dirLight.shadow.camera.top = 30000;
    dirLight.shadow.camera.bottom = -30000;

    scene.add(dirLight);

    // 半球光（天空感）
    const hemi = new THREE.HemisphereLight(0xffffff, 0x666666, 1.2);
    scene.add(hemi);

    // =====================================
    // Ground
    // =====================================
    const grid = new THREE.GridHelper(80000, 80, 0x888888, 0xbbbbbb);
    scene.add(grid);

    // =====================================
    // Load Model
    // =====================================
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load("/city.glb", (gltf) => {
      const model = gltf.scene;

      // -----------------------------
      // 模型材质优化
      // -----------------------------
      // model.traverse((child) => {
      //   if (child.isMesh) {
      //     child.castShadow = false;
      //     child.receiveShadow = true;

      //     child.frustumCulled = true;

      //     if (child.material) {
      //       child.material.depthWrite = true;
      //       child.material.depthTest = true;

      //       // 防重面闪烁
      //       child.material.polygonOffset = true;
      //       child.material.polygonOffsetFactor = 1;
      //       child.material.polygonOffsetUnits = 1;
      //     }
      //   }
      // });

      scene.add(model);

      // -----------------------------
      // 自动居中 & 自动相机
      // -----------------------------
      // const box = new THREE.Box3().setFromObject(model);
      // const size = box.getSize(new THREE.Vector3());
      // const center = box.getCenter(new THREE.Vector3());

      // controls.target.copy(center);

      // const maxDim = Math.max(size.x, size.y, size.z);

      // camera.position.set(
      //   center.x + maxDim * 0.8,
      //   center.y + maxDim * 0.45,
      //   center.z + maxDim * 0.8
      // );

      // camera.near = maxDim / 1000;
      // camera.far = maxDim * 10;
      // camera.updateProjectionMatrix();

      // controls.maxDistance = maxDim * 4;
      // controls.minDistance = maxDim / 100;

      // controls.update();
    });

    // =====================================
    // Resize
    // =====================================
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    // =====================================
    // Animation
    // =====================================
    const clock = new THREE.Clock();

    let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      controls.update(delta);

      renderer.render(scene, camera);
    };

    animate();

    // =====================================
    // Cleanup
    // =====================================
    return () => {
      cancelAnimationFrame(frameId);

      window.removeEventListener("resize", onResize);

      controls.dispose();
      renderer.dispose();
      dracoLoader.dispose();

      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    />
  );
}