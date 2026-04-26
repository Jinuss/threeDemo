import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { HDRCubeTextureLoader } from "three/examples/jsm/loaders/HDRCubeTextureLoader.js";


export default function BigModelViewer() {
  const mountRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#eee");

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000000000);
    // camera.position.set(2, 2, 5);
    // camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    camera.scale.set(1, 1, 1);
    camera.position.set(260, 152, 2482);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mountRef.current.appendChild(renderer.domElement);


    const hdrUrls = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'];
    const hdrCubeMap = new HDRCubeTextureLoader()
      .setPath('/hdr/')
      .load(hdrUrls, function () {
        scene.environment = hdrCubeMap;
      });

    // Draco
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "/city.glb",
      (gltf) => {
        console.log(gltf);
        scene.add(gltf.scene);
      },
      (xhr) => {
        const p = (xhr.loaded / xhr.total) * 100;
        // setProgress(p.toFixed(0));
      }
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();

    // 坐标系
    const axesHelper = new THREE.AxesHelper(5000);
    scene.add(axesHelper);
    const animate = () => {
      requestAnimationFrame(animate);
      // 更新轨道控制器
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }, []);

  return (
    <div ref={mountRef} style={{ height: '100%', width: '100%' }} />
  );
}