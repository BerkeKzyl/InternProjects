'use client';

import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { InteractiveRobotSpline } from "@/components/ui/interactive-3d-robot";
import { Button } from "@/components/ui/button";
import { Input, TextField } from "@/components/ui/textfield";
import { Label } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import { Form } from "react-aria-components";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

export default function Home() {
  const color = useMotionValue(COLORS_TOP[0]);
  const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const handleStartClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // Redirect to chat page with name
      router.push(`/chat?name=${encodeURIComponent(name.trim())}`);
    }
  };

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
    >
      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-1.5 inline-block rounded-full bg-gray-600/50 px-3 py-1.5 text-sm">
          Lc Waikiki
        </span>
        <h1 className="max-w-3xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-medium leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
          Sorunlarınızı Çözmek İçin Buradayız
        </h1>
        <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed">
         Alttaki buton yardımıyla bizimle iletişime geçebilirsin. ben ve beemo sana yardımcı olmak için sabırsızlanıyoruz.
        </p>
        {!showForm ? (
          <motion.button
            onClick={handleStartClick}
            style={{
              border,
              boxShadow,
            }}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50"
          >
            İletişime Geç
            <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Form onSubmit={handleFormSubmit} className="flex flex-col items-center gap-4">
              <TextField 
                name="name" 
                isRequired 
                value={name}
                onChange={setName}
                className="w-full"
              >
                <Label className="text-white mb-2 block">Adınızı girin</Label>
                <Input 
                  placeholder="Adınız..." 
                  className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </TextField>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!name.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2"
                >
                  Başla
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  İptal
                </Button>
              </div>
            </Form>
          </motion.div>
        )}
      </div>

      {/* 3D Robot in bottom right corner - Transparent background */}
      <div className="fixed -bottom-24 right-1 z-20 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
        <div className="relative w-full h-full">
          <InteractiveRobotSpline
            scene={ROBOT_SCENE_URL}
            className="w-full h-full"
          />
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 pointer-events-none">
            <span className="text-xs text-white/90 font-medium">Beemo</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2500} factor={4} fade speed={2} />
        </Canvas>
      </div>
    </motion.section>
  );
}
