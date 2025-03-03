"use client";
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, BorderStyle, WidthType, AlignmentType } from 'docx';
import _ from 'lodash';

// Component for AWS Cost Checklist
const AWSCostChecklist = () => {
    // State for loading status of PDF/DOCX libraries
    const [librariesLoaded, setLibrariesLoaded] = useState({
      pdf: false,
      docx: false
    });
    
    // Libraries will be stored here when loaded
    const [libs, setLibs] = useState({
      jspdf: null,
      docx: null
    });
  
    // Load libraries dynamically on client side
    useEffect(() => {
        const loadLibraries = async () => {
            try {
              // Load jsPDF - make sure we get a proper constructor
              const jsPDFModule = await import('jspdf');
              const jsPDFConstructor = jsPDFModule.default || jsPDFModule.jsPDF;
              
              // Create a test instance to ensure the constructor works
              const testDoc = new jsPDFConstructor();
              console.log("jsPDF loaded successfully", testDoc);
              
              // Load docx
              const docxModule = await import('docx');
              
              // Set the libraries first before attempting to initialize autotable
              setLibs({
                jspdf: jsPDFConstructor,
                docx: docxModule
              });
              
              // Now load autotable separately
              try {
                // Import the autotable module
                await import('jspdf-autotable').then(autoTableModule => {
                  console.log("Autotable module loaded", autoTableModule);
                  // AutoTable will register itself with the jsPDF prototype
                  // No need to manually call a function to attach it
                });
                console.log("AutoTable loaded successfully");
              } catch (autoTableError) {
                console.error("Error loading AutoTable:", autoTableError);
                // Continue anyway - we can use the manual table approach as fallback
              }
              
              setLibrariesLoaded({
                pdf: true,
                docx: true
              });
              
              console.log("Libraries loaded successfully");
            } catch (error) {
              console.error("Error loading libraries:", error);
              alert("Some document generation features might not be available. Please make sure you have jspdf and docx installed.");
            }
          };
      
      loadLibraries();
    }, []);
  
    // Data structure for checklist categories and items
    const [sections, setSections] = useState([
      {
        id: 1,
        title: "Account & Billing Setup",
        expanded: true,
        items: [
          { id: "1-1", text: "Activate AWS Cost Explorer", checked: false },
          { id: "1-2", text: "Set up AWS Budgets and alerts", checked: false },
          { id: "1-3", text: "Enable detailed billing reports to S3", checked: false },
          { id: "1-4", text: "Implement resource tagging strategy for cost allocation", checked: false },
          { id: "1-5", text: "Consolidate accounts with AWS Organizations", checked: false },
          { id: "1-6", text: "Review IAM roles and access to billing information", checked: false },
          { id: "1-7", text: "Enable AWS Trusted Advisor cost optimization checks", checked: false },
          { id: "1-8", text: "Set up anomaly detection for unusual spending patterns", checked: false }
        ]
      },
      {
        id: 2,
        title: "Compute Services Optimization",
        expanded: false,
        subsections: [
          {
            id: "2-1",
            title: "EC2",
            items: [
              { id: "2-1-1", text: "Identify and terminate unused or idle instances", checked: false },
              { id: "2-1-2", text: "Right-size over-provisioned instances", checked: false },
              { id: "2-1-3", text: "Implement auto-scaling for variable workloads", checked: false },
              { id: "2-1-4", text: "Use Spot Instances for non-critical, interruptible workloads", checked: false },
              { id: "2-1-5", text: "Purchase Reserved Instances or Savings Plans for predictable workloads", checked: false },
              { id: "2-1-6", text: "Evaluate Graviton ARM-based instances for better price/performance", checked: false },
              { id: "2-1-7", text: "Optimize EBS volumes (size, type, and unused volumes)", checked: false },
              { id: "2-1-8", text: "Remove unattached EBS volumes and unused snapshots", checked: false },
              { id: "2-1-9", text: "Implement lifecycle policies for EBS snapshots", checked: false }
            ]
          },
          {
            id: "2-2",
            title: "Lambda",
            items: [
              { id: "2-2-1", text: "Optimize memory allocation for Lambda functions", checked: false },
              { id: "2-2-2", text: "Analyze function timeout settings and execution durations", checked: false },
              { id: "2-2-3", text: "Review and optimize trigger frequencies", checked: false },
              { id: "2-2-4", text: "Check for recursive invocation patterns", checked: false },
              { id: "2-2-5", text: "Monitor cold starts and implement provisioned concurrency if needed", checked: false }
            ]
          }
        ]
      },
      {
        id: 3,
        title: "Storage Optimization",
        expanded: false,
        subsections: [
          {
            id: "3-1",
            title: "S3",
            items: [
              { id: "3-1-1", text: "Implement S3 lifecycle policies for proper tiering", checked: false },
              { id: "3-1-2", text: "Move infrequently accessed data to S3 Standard-IA", checked: false },
              { id: "3-1-3", text: "Move archival data to Glacier or Glacier Deep Archive", checked: false },
              { id: "3-1-4", text: "Enable S3 analytics to identify optimization opportunities", checked: false },
              { id: "3-1-5", text: "Review and delete unneeded objects/buckets", checked: false },
              { id: "3-1-6", text: "Optimize S3 request costs (batch operations vs. individual requests)", checked: false },
              { id: "3-1-7", text: "Review S3 replication needs and costs", checked: false }
            ]
          },
          {
            id: "3-2",
            title: "EBS & EFS",
            items: [
              { id: "3-2-1", text: "Audit EBS volumes for appropriate type (gp2, gp3, io1, etc.)", checked: false },
              { id: "3-2-2", text: "Convert from gp2 to gp3 where appropriate for cost savings", checked: false },
              { id: "3-2-3", text: "Delete unattached volumes and unnecessary snapshots", checked: false },
              { id: "3-2-4", text: "Implement EBS lifecycle management", checked: false },
              { id: "3-2-5", text: "Review EFS storage class and lifecycle policies", checked: false }
            ]
          }
        ]
      },
      {
        id: 4,
        title: "Database Services",
        expanded: false,
        items: [
          { id: "4-1", text: "Right-size RDS instances", checked: false },
          { id: "4-2", text: "Convert to Aurora if workload is suitable", checked: false },
          { id: "4-3", text: "Review and adjust provisioned IOPS", checked: false },
          { id: "4-4", text: "Implement RDS reserved instances for steady workloads", checked: false },
          { id: "4-5", text: "Assess if read replicas are necessary", checked: false },
          { id: "4-6", text: "Evaluate multi-AZ deployment necessity", checked: false },
          { id: "4-7", text: "Review DynamoDB provisioned capacity vs. on-demand pricing", checked: false },
          { id: "4-8", text: "Implement DynamoDB auto-scaling", checked: false },
          { id: "4-9", text: "Use DynamoDB Accelerator (DAX) only when necessary", checked: false },
          { id: "4-10", text: "Review ElastiCache instance sizes and types", checked: false }
        ]
      },
      {
        id: 5,
        title: "Networking",
        expanded: false,
        items: [
          { id: "5-1", text: "Audit and remove unused Elastic IPs", checked: false },
          { id: "5-2", text: "Review and optimize NAT Gateway usage", checked: false },
          { id: "5-3", text: "Analyze data transfer costs between services and regions", checked: false },
          { id: "5-4", text: "Implement VPC Endpoints for AWS service access to reduce NAT costs", checked: false },
          { id: "5-5", text: "Consolidate workloads in fewer regions when possible", checked: false },
          { id: "5-6", text: "Optimize CloudFront usage and distribution settings", checked: false },
          { id: "5-7", text: "Review Route 53 query volumes and zones", checked: false }
        ]
      },
      {
        id: 6,
        title: "Application & Container Services",
        expanded: false,
        items: [
          { id: "6-1", text: "Optimize ECS/EKS cluster sizes", checked: false },
          { id: "6-2", text: "Use Fargate Spot for non-critical workloads", checked: false },
          { id: "6-3", text: "Review and adjust App Runner service sizes", checked: false },
          { id: "6-4", text: "Audit container image sizes to reduce storage costs", checked: false },
          { id: "6-5", text: "Optimize container resource allocations (CPU/memory)", checked: false }
        ]
      },
      {
        id: 7,
        title: "Analytics & Big Data",
        expanded: false,
        items: [
          { id: "7-1", text: "Review EMR cluster types and sizes", checked: false },
          { id: "7-2", text: "Use spot instances for EMR processing tasks", checked: false },
          { id: "7-3", text: "Implement autoscaling for variable workloads", checked: false },
          { id: "7-4", text: "Audit Redshift node types and cluster sizes", checked: false },
          { id: "7-5", text: "Evaluate Redshift Reserved Nodes for steady workloads", checked: false },
          { id: "7-6", text: "Review Kinesis shard counts and provisioning", checked: false },
          { id: "7-7", text: "Optimize Glue DPU usage and job concurrency", checked: false }
        ]
      },
      {
        id: 8,
        title: "Machine Learning & AI Services",
        expanded: false,
        items: [
          { id: "8-1", text: "Audit SageMaker instance types and usage", checked: false },
          { id: "8-2", text: "Review inference endpoint sizing and scaling policies", checked: false },
          { id: "8-3", text: "Use spot instances for training when possible", checked: false },
          { id: "8-4", text: "Implement model compression techniques", checked: false },
          { id: "8-5", text: "Evaluate pay-per-use AI services vs. custom models", checked: false }
        ]
      },
      {
        id: 9,
        title: "Monitoring & Management",
        expanded: false,
        items: [
          { id: "9-1", text: "Review CloudWatch log retention periods", checked: false },
          { id: "9-2", text: "Audit CloudWatch metrics and custom metrics usage", checked: false },
          { id: "9-3", text: "Optimize X-Ray sampling rates", checked: false },
          { id: "9-4", text: "Review AWS Config recording settings", checked: false },
          { id: "9-5", text: "Evaluate CloudTrail trail configurations", checked: false }
        ]
      },
      {
        id: 10,
        title: "Advanced Optimization Strategies",
        expanded: false,
        items: [
          { id: "10-1", text: "Implement Infrastructure as Code for consistent deployments", checked: false },
          { id: "10-2", text: "Review architectural patterns for cost efficiency", checked: false },
          { id: "10-3", text: "Evaluate multi-account strategy effectiveness", checked: false },
          { id: "10-4", text: "Consider AWS Enterprise Discount Program (EDP) for large deployments", checked: false },
          { id: "10-5", text: "Implement FinOps practices and team structure", checked: false },
          { id: "10-6", text: "Schedule non-production environments for automatic shutdown", checked: false },
          { id: "10-7", text: "Evaluate third-party cost optimization tools", checked: false }
        ]
      },
      {
        id: 11,
        title: "Regular Review Process",
        expanded: false,
        items: [
          { id: "11-1", text: "Schedule weekly cost anomaly reviews", checked: false },
          { id: "11-2", text: "Conduct monthly service-specific optimization reviews", checked: false },
          { id: "11-3", text: "Perform quarterly comprehensive cost analysis", checked: false },
          { id: "11-4", text: "Review AWS pricing changes and new service offerings", checked: false },
          { id: "11-5", text: "Update internal chargeback/showback model", checked: false },
          { id: "11-6", text: "Track and celebrate cost optimization wins", checked: false }
        ]
      }
    ]);
  
    // Calculate overall progress
    const calculateProgress = () => {
      let totalItems = 0;
      let checkedItems = 0;
      
      sections.forEach(section => {
        if (section.items) {
          totalItems += section.items.length;
          checkedItems += section.items.filter(item => item.checked).length;
        }
        if (section.subsections) {
          section.subsections.forEach(subsection => {
            totalItems += subsection.items.length;
            checkedItems += subsection.items.filter(item => item.checked).length;
          });
        }
      });
      
      return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    };
    
    // Get optimization score rating based on progress
    const getScoreRating = (progress) => {
      if (progress >= 90) return { label: "Excellent", color: "text-green-600", description: "Your AWS environment is highly optimized. Keep maintaining these practices!" };
      if (progress >= 75) return { label: "Very Good", color: "text-green-500", description: "Your cost optimization efforts are paying off. Look at remaining items for additional savings." };
      if (progress >= 60) return { label: "Good", color: "text-blue-500", description: "You've made good progress. Several optimization opportunities still remain." };
      if (progress >= 40) return { label: "Fair", color: "text-yellow-500", description: "You've completed some key optimizations. Focus on high-impact items next." };
      if (progress >= 20) return { label: "Getting Started", color: "text-orange-500", description: "You're on the right path. Prioritize the easier wins first." };
      return { label: "Needs Attention", color: "text-red-500", description: "Begin your optimization journey with quick wins for immediate savings." };
    };
  
    // Toggle section expansion
    const toggleSection = (sectionId) => {
      setSections(sections.map(section => 
        section.id === sectionId 
          ? { ...section, expanded: !section.expanded } 
          : section
      ));
    };
    
    // Calculate section progress
    const calculateSectionProgress = (section) => {
      let totalItems = 0;
      let checkedItems = 0;
      
      if (section.items) {
        totalItems += section.items.length;
        checkedItems += section.items.filter(item => item.checked).length;
      }
      
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          totalItems += subsection.items.length;
          checkedItems += subsection.items.filter(item => item.checked).length;
        });
      }
      
      return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    };
  
    // Toggle item check state
    const toggleItem = (itemId, sectionId, subsectionId = null) => {
      setSections(sections.map(section => {
        if (section.id === sectionId) {
          if (subsectionId) {
            return {
              ...section,
              subsections: section.subsections.map(subsection => 
                subsection.id === subsectionId 
                  ? {
                      ...subsection,
                      items: subsection.items.map(item => 
                        item.id === itemId 
                          ? { ...item, checked: !item.checked } 
                          : item
                      )
                    }
                  : subsection
              )
            };
          } else {
            return {
              ...section,
              items: section.items.map(item => 
                item.id === itemId 
                  ? { ...item, checked: !item.checked } 
                  : item
              )
            };
          }
        }
        return section;
      }));
    };
  
    // Reset all checkboxes
    const resetChecklist = () => {
      const resetItems = (items) => items.map(item => ({ ...item, checked: false }));
      
      setSections(sections.map(section => {
        const updatedSection = { ...section };
        
        if (updatedSection.items) {
          updatedSection.items = resetItems(updatedSection.items);
        }
        
        if (updatedSection.subsections) {
          updatedSection.subsections = updatedSection.subsections.map(subsection => ({
            ...subsection,
            items: resetItems(subsection.items)
          }));
        }
        
        return updatedSection;
      }));
    };
  
    // Export checklist state
    const exportChecklist = () => {
      const checklistData = {
        title: "AWS Cost Analysis & Optimization Checklist",
        date: new Date().toISOString(),
        progress: calculateProgress(),
        scoreRating: getScoreRating(calculateProgress()).label,
        sections: sections
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(checklistData));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "aws_cost_checklist.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    };
  
    // Generate and download PDF
    // Generate and download PDF
    const downloadAsPDF = () => {
        if (!librariesLoaded.pdf) {
          alert("PDF library is still loading or not available. Please try again in a few moments.");
          return;
        }
        
        try {
          console.log("Starting PDF generation...");
          const jsPDFConstructor = libs.jspdf;
          
          if (!jsPDFConstructor) {
            throw new Error("jsPDF library is not properly loaded");
          }
          
          // Create a new document
          const doc = new jsPDFConstructor({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          // Test if the document was created successfully
          console.log("PDF instance created");
          
          // Add title
          doc.setFontSize(20);
          doc.setTextColor(15, 60, 100);
          doc.text('AWS Cost Analysis & Optimization Checklist', 15, 20);
          
          // Add date
          const date = new Date().toLocaleDateString();
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Generated on ${date}`, 15, 28);
          
          // Add overall progress
          const progress = calculateProgress();
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Overall Optimization Score: ${progress}%`, 20, 43);
          
          // Create a simple summary instead of a complex table
          doc.setFontSize(14);
          doc.text("Section Summaries:", 15, 60);
          
          // List sections with their progress
          let yPos = 70;
          sections.forEach(section => {
            const sectionProgress = calculateSectionProgress(section);
            doc.setFontSize(11);
            doc.text(`${section.title}: ${sectionProgress}%`, 20, yPos);
            yPos += 8;
            
            // Prevent overflow to next page
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
          });
          
          // Save PDF
          console.log("Saving PDF...");
          doc.save(`aws_cost_optimization_summary_${date.replace(/\//g, '-')}.pdf`);
          console.log("PDF saved successfully!");
        } catch (error) {
          console.error("Error generating PDF:", error);
          alert(`There was an error generating the PDF: ${error.message}. Check the console for details.`);
        }
    };
     
    // Generate and download DOCX
    const downloadAsDOCX = async () => {
      if (!librariesLoaded.docx) {
        alert("DOCX library is still loading or not available. Please try again in a few moments.");
        return;
      }
      
      try {
        console.log("Starting DOCX generation...");
        const { docx } = libs;
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType, AlignmentType } = docx;
        
        const progress = calculateProgress();
        const scoreRating = getScoreRating(progress);
        const date = new Date().toLocaleDateString();
        
        // Create document
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                // Title
                new Paragraph({
                  text: "AWS Cost Analysis & Optimization Checklist",
                  heading: HeadingLevel.HEADING_1,
                  spacing: {
                    after: 200
                  }
                }),
                
                // Date
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Generated on ${date}`,
                      color: "666666"
                    })
                  ],
                  spacing: {
                    after: 400
                  }
                }),
                
                // Overall Score Section
                new Paragraph({
                  text: `Overall Optimization Score: ${progress}%`,
                  heading: HeadingLevel.HEADING_2,
                  spacing: {
                    after: 200
                  }
                }),
                
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Rating: ${scoreRating.label}`,
                      bold: true,
                      size: 28,
                      color: progress < 30 ? "FF0000" : progress < 70 ? "FF8C00" : "008000"
                    })
                  ],
                  spacing: {
                    after: 200
                  }
                }),
                
                new Paragraph({
                  text: scoreRating.description,
                  spacing: {
                    after: 400
                  }
                }),
                
                // Section Breakdown header
                new Paragraph({
                  text: "Section Breakdown",
                  heading: HeadingLevel.HEADING_2,
                  spacing: {
                    after: 200
                  }
                }),
              ]
            }
          ]
        });
        
        // Create section breakdown table
        const sectionRows = sections.map(section => {
          const sectionProgress = calculateSectionProgress(section);
          const sectionRating = getScoreRating(sectionProgress).label;
          
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({text: section.title})],
                width: {
                  size: 60,
                  type: WidthType.PERCENTAGE
                }
              }),
              new TableCell({
                children: [new Paragraph({
                  text: `${sectionProgress}%`,
                  alignment: AlignmentType.CENTER
                })],
                width: {
                  size: 20,
                  type: WidthType.PERCENTAGE
                }
              }),
              new TableCell({
                children: [new Paragraph({
                  text: sectionRating,
                  alignment: AlignmentType.CENTER
                })],
                width: {
                  size: 20,
                  type: WidthType.PERCENTAGE
                }
              })
            ]
          });
        });
        
        // Add table to document
        const sectionTable = new Table({
          rows: [
            // Header row
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({text: "Section", bold: true})],
                  shading: {
                    fill: "2A5885"
                  }
                }),
                new TableCell({
                  children: [new Paragraph({text: "Progress", bold: true})],
                  shading: {
                    fill: "2A5885"
                  }
                }),
                new TableCell({
                  children: [new Paragraph({text: "Rating", bold: true})],
                  shading: {
                    fill: "2A5885"
                  }
                })
              ]
            }),
            ...sectionRows
          ],
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          }
        });
        
        doc.addSection({
          children: [sectionTable]
        });
        
        // Add detailed checklist for each section
        sections.forEach(section => {
          // Section title
          const sectionParagraph = new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_3,
            spacing: {
              before: 400,
              after: 200
            }
          });
          
          doc.addSection({
            children: [sectionParagraph]
          });
          
          // Section items
          if (section.items) {
            section.items.forEach(item => {
              const itemParagraph = new Paragraph({
                children: [
                  new TextRun({
                    text: item.checked ? "☑ " : "☐ ",
                    bold: true
                  }),
                  new TextRun({
                    text: item.text,
                    strike: item.checked,
                    color: item.checked ? "999999" : "000000"
                  })
                ],
                spacing: {
                  before: 100,
                  after: 100
                },
                indent: {
                  left: 720
                }
              });
              
              doc.addParagraph(itemParagraph);
            });
          }
          
          // Subsections
          if (section.subsections) {
            section.subsections.forEach(subsection => {
              // Subsection title
              const subsectionParagraph = new Paragraph({
                text: subsection.title,
                heading: HeadingLevel.HEADING_4,
                spacing: {
                  before: 300,
                  after: 200
                },
                indent: {
                  left: 720
                }
              });
              
              doc.addParagraph(subsectionParagraph);
              
              // Subsection items
              subsection.items.forEach(item => {
                const itemParagraph = new Paragraph({
                  children: [
                    new TextRun({
                      text: item.checked ? "☑ " : "☐ ",
                      bold: true
                    }),
                    new TextRun({
                      text: item.text,
                      strike: item.checked,
                      color: item.checked ? "999999" : "000000"
                    })
                  ],
                  spacing: {
                    before: 100,
                    after: 100
                  },
                  indent: {
                    left: 1440
                  }
                });
                
                doc.addParagraph(itemParagraph);
              });
            });
          }
        });
        
        // Generate and download the document
        console.log("Creating DOCX blob...");
        Packer.toBlob(doc).then(blob => {
          console.log("DOCX blob created, preparing download...");
          const url = URL.createObjectURL(blob);
          const downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", url);
          downloadAnchorNode.setAttribute("download", `aws_cost_optimization_report_${date.replace(/\//g, '-')}.docx`);
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
          URL.revokeObjectURL(url);
          console.log("DOCX downloaded successfully!");
        });
      } catch (error) {
        console.error("Error generating DOCX:", error);
        alert("There was an error generating the DOCX. Please check the console for details.");
      }
    };
  
    const progress = calculateProgress();
  
    return (
      <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
        <header className="bg-blue-700 text-white p-6 rounded-t-lg shadow-md">
          <h1 className="text-3xl font-bold">AWS Cost Analysis & Optimization Checklist</h1>
          <p className="mt-2 text-blue-100">Track your AWS cost optimization progress with this interactive checklist</p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-600">Excellent: 90%+</div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500">Very Good: 75-89%</div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500">Good: 60-74%</div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500">Fair: 40-59%</div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500">Getting Started: 20-39%</div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-500">Needs Attention: 0-19%</div>
          </div>
        </header>
  
        <div className="bg-white p-6 rounded-b-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="w-full md:w-2/3 mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <h2 className="text-xl font-semibold">Overall Progress: {progress}%</h2>
                <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${getScoreRating(progress).color}`}>
                  {getScoreRating(progress).label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 relative">
                <div 
                  className="h-6 rounded-full transition-all duration-500 ease-out relative"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: progress < 30 ? '#EF4444' : progress < 70 ? '#F59E0B' : '#10B981'
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {progress}%
                  </span>
                </div>
                
                {/* Milestone markers */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {[20, 40, 60, 80].map(milestone => (
                    <div 
                      key={milestone}
                      className="absolute top-0 bottom-0 w-px bg-gray-600 z-10"
                      style={{ left: `${milestone}%` }}
                    >
                      <div className="absolute -top-6 transform -translate-x-1/2 bg-gray-700 text-white text-xs py-1 px-2 rounded">
                        {milestone}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm mt-2 text-gray-600">{getScoreRating(progress).description}</p>
            </div>
            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-4 flex-wrap">
              <button 
                onClick={resetChecklist}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-300"
              >
                Reset All
              </button>
              <button 
                onClick={exportChecklist}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
              >
                Export Data
              </button>
              <button 
                onClick={downloadAsPDF}
                className={`${librariesLoaded.pdf ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'} text-white font-semibold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center`}
                disabled={!librariesLoaded.pdf}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                {librariesLoaded.pdf ? 'Download PDF' : 'Loading PDF...'}
              </button>
              <button 
                onClick={downloadAsDOCX}
                className={`${librariesLoaded.docx ? 'bg-blue-800 hover:bg-blue-900' : 'bg-blue-400 cursor-not-allowed'} text-white font-semibold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center`}
                disabled={!librariesLoaded.docx}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {librariesLoaded.docx ? 'Download DOCX' : 'Loading DOCX...'}
              </button>
            </div>
          </div>
        </div>
  
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button 
                className="w-full p-4 text-left bg-gray-100 hover:bg-gray-200 transition duration-300 flex justify-between items-center"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  
                  {/* Section progress indicator */}
                  <div className="ml-4 flex items-center">
                    <div className="w-24 bg-gray-300 h-2 rounded-full mr-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${calculateSectionProgress(section)}%`,
                          backgroundColor: 
                            calculateSectionProgress(section) < 30 ? '#EF4444' : 
                            calculateSectionProgress(section) < 70 ? '#F59E0B' : '#10B981'
                        }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      calculateSectionProgress(section) < 30 ? 'text-red-600' : 
                      calculateSectionProgress(section) < 70 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {calculateSectionProgress(section)}%
                    </span>
                  </div>
                  
                  {/* Section rating badge */}
                  <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${getScoreRating(calculateSectionProgress(section)).color.replace('text-', 'bg-').replace('600', '100')} ${getScoreRating(calculateSectionProgress(section)).color}`}>
                    {getScoreRating(calculateSectionProgress(section)).label}
                  </span>
                </div>
                
                <svg 
                  className={`w-6 h-6 transform transition-transform duration-300 ${section.expanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
  
              {section.expanded && (
                <div className="p-4">
                  {section.items && (
                    <div className="mb-4">
                      {section.items.map(item => (
                        <div key={item.id} className="flex items-start p-2 hover:bg-gray-50 rounded">
                          <input 
                            type="checkbox" 
                            id={item.id}
                            checked={item.checked}
                            onChange={() => toggleItem(item.id, section.id)}
                            className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor={item.id} className={`ml-3 ${item.checked ? 'line-through text-gray-500' : ''}`}>
                            {item.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
  
                  {section.subsections && section.subsections.map(subsection => (
                    <div key={subsection.id} className="mb-4">
                      <h3 className="font-medium text-lg text-gray-800 mb-2 pb-1 border-b border-gray-200">
                        {subsection.title}
                      </h3>
                      <div className="pl-2">
                        {subsection.items.map(item => (
                          <div key={item.id} className="flex items-start p-2 hover:bg-gray-50 rounded">
                            <input 
                              type="checkbox" 
                              id={item.id}
                              checked={item.checked}
                              onChange={() => toggleItem(item.id, section.id, subsection.id)}
                              className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor={item.id} className={`ml-3 ${item.checked ? 'line-through text-gray-500' : ''}`}>
                              {item.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
  
        <footer className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            <a 
              href="https://aws.amazon.com/aws-cost-management/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              AWS Cost Management Resources
            </a> | 
            <a 
              href="https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-2"
            >
              Well-Architected Framework (Cost Optimization)
            </a>
          </p>
        </footer>
      </div>
    );
  };
  
  export default AWSCostChecklist;