import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Form schema using zod
const messageSchema = z.object({
  name: z.string().min(1, { message: "Please enter your name" }),
  message: z.string().min(2, { message: "Please write a birthday wish" }).max(300, { message: "Message must be less than 300 characters" })
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageItem {
  id: number;
  name: string;
  message: string;
  timestamp: string;
}

export default function MessageWall() {
  const { toast } = useToast();
  
  // Default seed messages
  const defaultMessages: MessageItem[] = [
    {
      id: 1,
      name: "Kivan",
      message: "Happy birthday Aqsa! Wishing you a day filled with joy and laughter. You deserve all the happiness in my world!",
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      name: "Ahmed",
      message: "May your day be as special as you are. Many happy returns!",
      timestamp: new Date().toISOString()
    },
    {
      id: 3,
      name: "Fatima",
      message: "To many more years of friendship and celebrations. Happy birthday!",
      timestamp: new Date().toISOString()
    }
  ];

  // Fetch messages with automatic fallback for static hosts like Netlify
  const { data: messages = defaultMessages, isLoading, refetch } = useQuery<MessageItem[]>({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem('aqsa_birthday_wishes', JSON.stringify(data));
            return data;
          }
        }
      } catch (e) {
        // Fallback for static environments
      }
      try {
        const saved = localStorage.getItem('aqsa_birthday_wishes');
        if (saved) return JSON.parse(saved);
      } catch {}
      return defaultMessages;
    },
    staleTime: 0,
  });
  
  // Add new message mutation with offline/static support
  const { mutate: addMessage, isPending } = useMutation({
    mutationFn: async (data: MessageFormValues) => {
      const fallbackItem: MessageItem = {
        id: Date.now(),
        name: data.name,
        message: data.message,
        timestamp: new Date().toISOString()
      };

      try {
        const response = await apiRequest('POST', '/api/messages', data);
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn("Backend unavailable, storing message in local storage");
      }

      // Store in localStorage for static deployment
      try {
        const currentSaved: MessageItem[] = JSON.parse(localStorage.getItem('aqsa_birthday_wishes') || '[]');
        const updated = [fallbackItem, ...(currentSaved.length ? currentSaved : defaultMessages)];
        localStorage.setItem('aqsa_birthday_wishes', JSON.stringify(updated));
      } catch {}
      return fallbackItem;
    },
    onSuccess: (newMessage: MessageItem) => {
      // 1. Instantly update the query cache so the wish shows up below immediately
      queryClient.setQueryData<MessageItem[]>(['/api/messages'], (old = []) => {
        const list = Array.isArray(old) ? old : [];
        if (list.some(m => m.id === newMessage.id)) return list;
        return [newMessage, ...list];
      });
      
      // 2. Invalidate query and trigger active refetch
      queryClient.invalidateQueries({
        queryKey: ['/api/messages'],
        refetchType: 'all',
      });
      refetch();

      // 3. Play confetti celebration sound
      const sfx = new Audio('/confetti.mp3');
      sfx.volume = 0.4;
      sfx.play().catch(() => {});

      // 4. Reset form fields
      form.reset({ name: '', message: '' });

      // 5. Toast confirmation
      toast({
        title: "Wish posted! 🎉",
        description: "Your birthday wish has been added to Aqsa's message wall.",
      });
    },
    onError: (error) => {
      console.error("Error posting message:", error);
      toast({
        title: "Failed to post wish",
        description: "Please check your message and try again.",
        variant: "destructive"
      });
    }
  });

  // Define form
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      name: '',
      message: ''
    },
  });

  // Handle form submission
  const onSubmit = (data: MessageFormValues) => {
    addMessage(data);
  };

  // Deterministic rotation based on id
  const getRotation = (id: number) => {
    const rotations = [-1.5, 1.2, -0.8, 1.8, -2, 1];
    return rotations[Math.abs(id) % rotations.length];
  };

  // Deterministic vibrant color based on id
  const getColorClass = (id: number) => {
    const colors = [
      'text-rose-600',
      'text-pink-600',
      'text-purple-600',
      'text-indigo-600',
      'text-amber-600',
      'text-emerald-600',
    ];
    return colors[Math.abs(id) % colors.length];
  };

  const formatWishDate = (ts?: string) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return "";
    }
  };

  return (
    <section 
      id="message-wall" 
      className="section bg-gradient-to-bl from-primary/20 to-secondary/20 flex flex-col items-center justify-start px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Birthday Wishes</h2>
      <p className="cursive text-xl text-accent text-center mb-8">Messages from friends & family</p>
      
      {/* Add Message Form */}
      <div className="max-w-md w-full mb-10 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Leave a Birthday Wish</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your name" 
                      {...field} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your birthday wish for Aqsa here..." 
                      {...field} 
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-all font-semibold"
            >
              {isPending ? 'Posting Wish...' : 'Post Wish 💌'}
            </Button>
          </form>
        </Form>
      </div>
      
      {/* Messages Container */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/50 rounded-lg shadow-md p-4 h-28 animate-pulse" />
          ))
        ) : messages.length > 0 ? (
          // Messages
          messages.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md p-5 border border-pink-100/70 hover:shadow-lg transition-all flex flex-col justify-between"
              style={{ transform: `rotate(${getRotation(item.id)}deg)` }}
            >
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xl">💌</span>
                <p className="text-sm md:text-base text-gray-800 leading-relaxed font-normal">
                  {item.message}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
                <span className="text-xs text-gray-400">
                  {formatWishDate(item.timestamp)}
                </span>
                <span className={`text-sm font-bold ${getColorClass(item.id)}`}>
                  — {item.name}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center py-8">
            <p className="text-neutral-dark/70">Be the first to leave a birthday wish for Aqsa!</p>
          </div>
        )}
      </div>
    </section>
  );
}
