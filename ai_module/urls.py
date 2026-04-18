from django.urls import path
from .views import AIAdvisorView, AIInsightsView

urlpatterns = [
    path('advice/', AIAdvisorView.as_view(), name='ai-advice'),
    path('insights/', AIInsightsView.as_view(), name='ai-insights'),
]
