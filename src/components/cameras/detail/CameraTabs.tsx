
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CameraTabs = () => {
  return (
    <Tabs defaultValue="recordings" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="recordings">Recordings</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="recordings" className="border rounded-md p-4 mt-2">
        <div className="text-center p-8">
          <h3 className="text-lg font-medium mb-2">No recordings available</h3>
          <p className="text-muted-foreground">Recordings will appear here when available</p>
        </div>
      </TabsContent>
      <TabsContent value="events" className="border rounded-md p-4 mt-2">
        <div className="text-center p-8">
          <h3 className="text-lg font-medium mb-2">No events detected</h3>
          <p className="text-muted-foreground">Events will appear here when detected</p>
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="border rounded-md p-4 mt-2">
        <div className="text-center p-8">
          <h3 className="text-lg font-medium mb-2">Analytics not available</h3>
          <p className="text-muted-foreground">
            Enable analytics in settings to view data
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CameraTabs;
