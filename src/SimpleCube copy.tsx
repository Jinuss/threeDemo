import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const colors = [0xE0FF00,  // 青柠绿
  0x0066FF,  // 天蓝
  0xFF00CC,  // 玫红
  0xFF6600,  // 橙色
  0x9900FF,  // 紫色
  0x00FFFF   // 青色
]

function SimpleCube() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // 加载器
    const loader = new THREE.TextureLoader();

    const textures = ['5', '2', '3', '4', '1', '6'].map((item, index) => {
      const texture = loader.load(`./dice_tiles/dice_${item}.png`);
      return texture;
    })
    // 场景
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xffffff);
    // 加载模型
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./city.glb', (gltf) => {
      console.log(gltf);
      // 设置模型缩放
      // gltf.scene.position.set(0, 0, 0);
      // gltf.scene.scale.set(1, 1, 1);
      scene.add(gltf.scene);
    });
 // 环境底光（自然漫反射）
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));

// 太阳方向光
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);
    // 透视相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // 渲染器
    const renderer = new THREE.WebGLRenderer();

    // 设置渲染器大小
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 将渲染器添加到页面中
    containerRef.current.appendChild(renderer.domElement);

    // 创建几何体
    const geometry = new THREE.BoxGeometry();
    // 创建材质

    const color_materials = colors.map(color => new THREE.MeshBasicMaterial({ color }));

    const dice_materials = textures.map(texture => new THREE.MeshBasicMaterial({ map: texture }));

    const materials = color_materials;
    // 创建网格对象
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.set(0, 0, 0);
    // 将网格对象添加到场景中
    scene.add(cube);

    // 设置相机位置
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // 创建轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    // 设置轨道控制器参数
    controls.enableDamping = true;
    // 设置阻尼系数
    controls.dampingFactor = 0.05;
    // 设置缩放
    controls.minDistance = 1;
    controls.maxDistance = 10;
    // 设置自动旋转
    controls.autoRotate = true;
    // 设置自动旋转速度
    controls.autoRotateSpeed = 0.5;
    // 设置是否启用缩放
    controls.enableZoom = true;
    // 设置是否启用自动旋转
    controls.autoRotate = true;
    controls.update();

    // 坐标系
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 创建GUI控制器
    const gui = new GUI();
    const folder = gui.addFolder("立方体");
    folder.add(cube.position, "x").name('X轴').min(-5).max(5).step(0.1);
    folder.add(cube.position, "y").name('Y轴').min(-5).max(5).step(0.1);
    folder.add(cube.position, "z").name('Z轴').min(-5).max(5).step(0.1);
    // folder.addColor(material, "color");
    // folder.add(material, "wireframe");
    folder.add(cube, "material", {
      'color': color_materials,
      'dice': dice_materials,
    });

    folder.open();

    // 创建统计信息
    const stats = new Stats();
    // 将统计信息添加到页面中
    containerRef.current.appendChild(stats.domElement);
    // 创建动画函数
    const animate = function () {
      requestAnimationFrame(animate);
      // 更新轨道控制器
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 清理函数
    return () => {
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef}></div>;
}

export default SimpleCube;