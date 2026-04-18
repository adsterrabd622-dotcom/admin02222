import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Video, videoSchema, VideoFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Edit2, Trash2, ExternalLink, Play, Clock, LayoutGrid, List as ListIcon, Video as VideoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Dashboard = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema)
  });

  useEffect(() => {
    const q = query(
      collection(db, 'videos'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
      setVideos(vids);
    }, (error) => {
      console.error(error);
      toast.error('Failed to load videos. Check console for details.');
    });
    return unsubscribe;
  }, []);

  const onSubmit = async (data: VideoFormData) => {
    try {
      if (editingVideo) {
        await updateDoc(doc(db, 'videos', editingVideo.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        toast.success('Video updated successfully');
      } else {
        await addDoc(collection(db, 'videos'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Video added successfully');
      }
      reset();
      setEditingVideo(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error('Error saving video: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteDoc(doc(db, 'videos', id));
      toast.success('Video deleted');
    } catch (error: any) {
      toast.error('Delete failed');
    }
  };

  const startEdit = (video: Video) => {
    setEditingVideo(video);
    setValue('title', video.title);
    setValue('thumbnail', video.thumbnail);
    setValue('duration', video.duration);
    setValue('description', video.description || '');
    setValue('videoUrl', video.videoUrl);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border border shadow-none rounded-lg p-6">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Total Videos</div>
          <div className="text-3xl font-mono font-bold">{videos.length}</div>
        </Card>
        <Card className="bg-card border-border border shadow-none rounded-lg p-6">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Storage Used</div>
          <div className="text-3xl font-mono font-bold">{(videos.length * 12.4).toFixed(1)} GB</div>
        </Card>
        <Card className="bg-card border-border border shadow-none rounded-lg p-6">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Project ID</div>
          <div className="text-xl font-mono text-primary truncate">viral-c349c</div>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h3 className="text-lg font-semibold">Video Library</h3>
          <p className="text-sm text-muted-foreground">Manage your content library and metadata.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted/30 border border-border/50 rounded-md p-0.5">
             <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-7 w-8 p-0"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-7 w-8 p-0"
              onClick={() => setViewMode('table')}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) { setEditingVideo(null); reset(); }
          }}>
            <DialogTrigger 
              render={
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add New Video
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[500px] border-border bg-card">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{editingVideo ? 'Edit Video Metadata' : 'Upload Video Metadata'}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[80vh] px-1">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground">Video Title</Label>
                    <Input id="title" {...register('title')} placeholder="Mountain Drone Cinematic" className="bg-background/50 border-border" />
                    {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-xs uppercase tracking-wider text-muted-foreground">Duration</Label>
                      <Input id="duration" {...register('duration')} placeholder="04:22" className="bg-background/50 border-border font-mono" />
                      {errors.duration && <p className="text-destructive text-xs">{errors.duration.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail" className="text-xs uppercase tracking-wider text-muted-foreground">Thumbnail (URL)</Label>
                      <Input id="thumbnail" {...register('thumbnail')} placeholder="https://..." className="bg-background/50 border-border" />
                      {errors.thumbnail && <p className="text-destructive text-xs">{errors.thumbnail.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl" className="text-xs uppercase tracking-wider text-muted-foreground">Target URL</Label>
                    <Input id="videoUrl" {...register('videoUrl')} placeholder="https://youtube.com/..." className="bg-background/50 border-border" />
                    {errors.videoUrl && <p className="text-destructive text-xs">{errors.videoUrl.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">Description Snippet</Label>
                    <Textarea id="description" {...register('description')} placeholder="Cinematic description..." rows={4} className="bg-background/50 border-border" />
                    {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold py-6">
                      {editingVideo ? 'Update Records' : 'Save Video'}
                    </Button>
                  </DialogFooter>
                </form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {videos.length === 0 ? (
        <Card className="bg-card/30 border-dashed border-border py-12">
          <CardContent className="flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 bg-muted/20 border border-border rounded-full flex items-center justify-center">
              <VideoIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-muted-foreground">No media found in library</h3>
              <p className="text-sm text-muted-foreground/60 max-w-[300px]">Connected to Firebase: viral-c349c</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="border-border hover:bg-muted">Add first entry</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-collapse">
              {videos.map((video) => (
                <div key={video.id} className="group border-[0.5px] border-border/40 hover:bg-muted/30 transition-all duration-300 flex flex-col p-4 gap-4">
                  <div className="relative aspect-video rounded overflow-hidden bg-muted/20">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-black/80 font-mono text-[10px] px-1.5 py-0.5 rounded text-white flex items-center gap-1 border border-white/10 uppercase">
                        {video.duration}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em] leading-relaxed">
                      {video.description || 'No metadata description provided.'}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/30">
                     <div className="flex gap-4">
                        <button onClick={() => startEdit(video)} className="text-[11px] font-bold text-primary uppercase tracking-wider hover:opacity-80">Edit</button>
                        <button onClick={() => handleDelete(video.id)} className="text-[11px] font-bold text-destructive uppercase tracking-wider hover:opacity-80">Delete</button>
                     </div>
                     <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                     </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="border-border">
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground px-6 py-4">Thumbnail</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground px-6 py-4">Video Title</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground px-6 py-4">Duration</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground px-6 py-4">Snippet</TableHead>
                  <TableHead className="text-right text-[10px] uppercase tracking-widest text-muted-foreground px-6 py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id} className="border-border hover:bg-muted/20 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="w-16 h-10 bg-muted/40 rounded overflow-hidden">
                        <img 
                          src={video.thumbnail} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-semibold text-sm line-clamp-1">{video.title}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: {video.id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                       <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50">{video.duration}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground text-xs max-w-[200px] truncate italic">
                      {video.description || '...'}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-4">
                         <button onClick={() => startEdit(video)} className="text-[11px] font-bold text-primary uppercase tracking-wider">Edit</button>
                         <button onClick={() => handleDelete(video.id)} className="text-[11px] font-bold text-destructive uppercase tracking-wider">Delete</button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};
