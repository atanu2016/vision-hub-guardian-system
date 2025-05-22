
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AlertHistory = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
        <CardDescription>
          View recent alerts from your cameras
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Alert history will be implemented in a future update</p>
          <Button className="mt-4" variant="outline">Export Alert History</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertHistory;
