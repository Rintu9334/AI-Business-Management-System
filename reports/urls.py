from django.urls import path
from .views import ReportView, ReportExportCSVView, ReportExportJSONView

urlpatterns = [
    path('', ReportView.as_view(), name='report-main'),
    path('export/csv/', ReportExportCSVView.as_view(), name='report-export-csv'),
    path('export/json/', ReportExportJSONView.as_view(), name='report-export-json'),
]
