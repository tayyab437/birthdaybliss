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
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  message: z.string().min(5, { message: "Message must be at least 5 characters" }).max(200, { message: "Message must be less than 200 characters" })
});

type MessageFormValues = z.infer<typeof messageSchema>;

export default function MessageWall() {
  const { toast } = useToast();
  
  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Array<{ id: number, name: string, message: string, timestamp: string }>>({
    queryKey: ['/api/messages'],
  });
  
  // Add new message mutation
  const { mutate: addMessage, isPending } = useMutation({
    mutationFn: async (data: MessageFormValues) => {
      const response = await apiRequest('POST', '/api/messages', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: "Message posted!",
        description: "Your birthday wish has been added to the wall.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to post message",
        description: String(error),
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

  // Get a random rotation between -3 and 3 degrees
  const getRandomRotation = () => {
    return Math.floor(Math.random() * 7) - 3;
  };

  // Get a random color for the message
  const getRandomColor = () => {
    const colors = ['text-accent', 'text-primary', 'text-secondary'];
    return colors[Math.floor(Math.random() * colors.length)];
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
                      placeholder="Write your birthday wish here..." 
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
              className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-all"
            >
              {isPending ? 'Posting...' : 'Post Wish'}
            </Button>
          </form>
        </Form>
      </div>
      
      {/* Messages Container */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/50 rounded-lg shadow-md p-4 h-24 animate-pulse" />
          ))
        ) : messages.length > 0 ? (
          // Messages
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-md p-4"
              style={{ transform: `rotate(${getRandomRotation()}deg)` }}
            >
              <p className="text-sm mb-2 leading-relaxed">{message.message}</p>
              <p className={`text-right text-sm font-bold ${getRandomColor()}`}>
                - {message.name}
              </p>
            </motion.div>
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center py-8">
            <p className="text-neutral-dark/70">Be the first to leave a birthday wish!</p>
          </div>
        )}
      </div>
    </section>
  );
}
